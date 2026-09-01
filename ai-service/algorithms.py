import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def compute_content_similarity(df_tours):
    """
    Tính ma trận Cosine Similarity cho tất cả các tour dựa trên Content-Based (TF-IDF).
    """
    if df_tours.empty:
        return None
        
    # Gộp nội dung để đánh giá
    df_tours['content'] = df_tours[['category', 'region', 'province', 'tags']].fillna('').agg(' '.join, axis=1)
    
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df_tours['content'])
    
    # Tính Cosine Similarity
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    return cosine_sim

def has_enough_interactions(df_interactions, user_id, min_count=3):
    """
    Kiểm tra xem User có đủ số lượng tương tác tối thiểu để chạy Collaborative Filtering không.
    """
    if df_interactions.empty:
        return False
    user_history = df_interactions[df_interactions['user_id'] == user_id]
    return len(user_history) >= min_count

def compute_user_similarity(df_interactions):
    """
    Tạo User-Item Matrix và tính Cosine Similarity giữa các User (Collaborative Filtering).
    Trả về DataFrame chứa độ tương đồng giữa các User, và df_grouped để tra cứu.
    """
    if df_interactions.empty:
        return None, None
        
    # Tính tổng weight cho mỗi cặp (user, tour)
    df_grouped = df_interactions.groupby(['user_id', 'tour_id'])['weight'].sum().reset_index()
    
    # Tạo Ma trận User-Item
    user_item_matrix = df_grouped.pivot(index='user_id', columns='tour_id', values='weight').fillna(0)
    
    # Tính Cosine Similarity
    user_sim_matrix = cosine_similarity(user_item_matrix)
    user_sim_df = pd.DataFrame(user_sim_matrix, index=user_item_matrix.index, columns=user_item_matrix.index)
    
    return user_sim_df, df_grouped
