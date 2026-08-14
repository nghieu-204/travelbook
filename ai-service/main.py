from fastapi import FastAPI, HTTPException
import mysql.connector
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
from dotenv import load_dotenv

# Load .env from backend directory
env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Travel Booking AI Service")

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "travel_booking"),
        port=int(os.getenv("DB_PORT", 3307))
    )

@app.get("/")
def health_check():
    return {"status": "ok", "service": "AI Recommendation System"}

@app.get("/recommend/tour/{tour_id}")
def recommend_similar_tours(tour_id: int, limit: int = 4):
    """
    Content-Based Filtering: Gợi ý Tour tương tự dựa trên đặc tính của Tour.
    """
    conn = get_db_connection()
    
    # 1. Lấy dữ liệu tất cả tours và tags (loại hình)
    query = """
        SELECT t.id, t.name, 
            COALESCE(c.name, '') as category, 
            COALESCE(r.name, '') as region, 
            COALESCE(d.name, '') as province,
            (SELECT GROUP_CONCAT(tt.name SEPARATOR ' ') 
             FROM tour_tourtype ttt 
             JOIN tourtype tt ON ttt.type_id = tt.id 
             WHERE ttt.tour_id = t.id) as tags
        FROM tours t
        LEFT JOIN Tour_Destination td ON t.id = td.tour_id AND td.is_primary = TRUE
        LEFT JOIN destination d ON td.destination_id = d.id
        LEFT JOIN country co ON d.country_id = co.id
        LEFT JOIN region r ON r.id = COALESCE(d.region_id, co.region_id)
        LEFT JOIN tourcategory c ON r.category_id = c.id
    """
    df_tours = pd.read_sql(query, conn)
    conn.close()

    if df_tours.empty:
        return {"tours": []}

    # Tạo một chuỗi "nội dung" gộp chung để so sánh độ tương đồng
    # Ví dụ: "Trong nước Tây Bắc Lào Cai Leo núi Khám phá"
    df_tours['content'] = df_tours[['category', 'region', 'province', 'tags']].fillna('').agg(' '.join, axis=1)

    # 2. Vector hóa nội dung bằng TF-IDF
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df_tours['content'])

    # 3. Tính ma trận Cosine Similarity
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # 4. Tìm index của tour_id được yêu cầu
    try:
        idx = df_tours.index[df_tours['id'] == tour_id].tolist()[0]
    except IndexError:
        raise HTTPException(status_code=404, detail="Tour not found")

    # 5. Lấy điểm số tương đồng của tất cả tours với tour hiện tại
    sim_scores = list(enumerate(cosine_sim[idx]))

    # Sắp xếp giảm dần theo điểm số
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Lấy top N tours (bỏ qua tour chính nó ở index 0)
    sim_scores = sim_scores[1:limit+1]
    
    tour_indices = [i[0] for i in sim_scores]
    recommended_tour_ids = df_tours.iloc[tour_indices]['id'].tolist()

    return {"tours": recommended_tour_ids, "method": "content-based"}


@app.get("/recommend/user/{user_id}")
def recommend_for_user(user_id: int, limit: int = 4):
    """
    Collaborative Filtering: Gợi ý Tour cho người dùng dựa trên hành vi lịch sử.
    (Sử dụng User-Item Interaction Matrix)
    """
    conn = get_db_connection()
    
    # Lấy tất cả lịch sử tương tác
    query = "SELECT user_id, tour_id, weight FROM user_interactions"
    df_interactions = pd.read_sql(query, conn)
    
    if df_interactions.empty or user_id not in df_interactions['user_id'].values:
        conn.close()
        # Fallback: Trả về Tour phổ biến nhất nếu người dùng chưa có hành vi (Cold Start)
        return {"tours": [], "method": "popular (cold-start)"}
    
    # Tính điểm tổng hợp (sum weight) cho mỗi cặp (user, tour)
    df_grouped = df_interactions.groupby(['user_id', 'tour_id']).sum().reset_index()

    # Tạo Ma trận User-Item
    user_item_matrix = df_grouped.pivot(index='user_id', columns='tour_id', values='weight').fillna(0)
    
    # Tính độ tương đồng giữa các User (User-based Collaborative Filtering)
    user_similarity = cosine_similarity(user_item_matrix)
    user_sim_df = pd.DataFrame(user_similarity, index=user_item_matrix.index, columns=user_item_matrix.index)

    # Lấy danh sách các tour user này đã tương tác
    user_interacted_tours = df_grouped[df_grouped['user_id'] == user_id]['tour_id'].tolist()

    # Tìm User giống nhất (Top 3 Users)
    similar_users = user_sim_df[user_id].sort_values(ascending=False)[1:4].index.tolist()

    recommended_tours = {}
    
    for sim_user in similar_users:
        # Lấy các tour mà sim_user đã xem/đặt nhưng user hiện tại chưa xem
        sim_user_tours = df_grouped[df_grouped['user_id'] == sim_user]
        
        for _, row in sim_user_tours.iterrows():
            t_id = row['tour_id']
            if t_id not in user_interacted_tours:
                # Cộng dồn điểm gợi ý = Độ tương đồng của User * Trọng số tương tác
                score = user_sim_df.loc[user_id, sim_user] * row['weight']
                recommended_tours[t_id] = recommended_tours.get(t_id, 0) + score
                
    conn.close()

    if not recommended_tours:
        return {"tours": [], "method": "popular (cold-start fallback)"}

    # Sắp xếp điểm số giảm dần
    sorted_recommendations = sorted(recommended_tours.items(), key=lambda x: x[1], reverse=True)
    top_tour_ids = [t[0] for t in sorted_recommendations[:limit]]
    
    return {"tours": top_tour_ids, "method": "collaborative-filtering"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
