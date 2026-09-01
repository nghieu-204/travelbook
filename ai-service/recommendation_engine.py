import pandas as pd
from database import get_all_tours, get_user_interactions
from algorithms import compute_content_similarity, has_enough_interactions, compute_user_similarity

def get_recently_viewed(user_id, limit=4):
    """
    Lấy danh sách tour user đã xem gần nhất, loại trùng, lấy mới nhất trước.
    Không trả về những tour user đã đặt.
    """
    if not user_id:
        return []
        
    df_interactions = get_user_interactions()
    if df_interactions.empty:
        return []
        
    user_history = df_interactions[df_interactions['user_id'] == user_id]
    if user_history.empty:
        return []
        
    # Loại tour đã book
    booked_tours = user_history[user_history['interaction_type'] == 'book']['tour_id'].tolist()
    views_history = user_history[user_history['interaction_type'] == 'view']
    
    if views_history.empty:
        return []
        
    # Sắp xếp xem gần nhất, loại trùng, giữ lại lần xem cuối cùng
    views_history = views_history.sort_values('created_at', ascending=False)
    views_history = views_history.drop_duplicates(subset=['tour_id'], keep='first')
    
    # Loại bỏ tour đã đặt
    views_history = views_history[~views_history['tour_id'].isin(booked_tours)]
    
    recent_tour_ids = views_history.head(limit)['tour_id'].tolist()
    
    df_tours = get_all_tours()
    if df_tours.empty:
        return []
        
    # Format kết quả trả về với full info
    result = []
    for tid in recent_tour_ids:
        try:
            tour_data = df_tours[df_tours['id'] == tid].iloc[0].to_dict()
            result.append(tour_data)
        except IndexError:
            continue
            
    return result


def get_personalized_tours(user_id, limit=4, min_interactions=3):
    """
    Lấy danh sách tối đa 4 tour dành riêng cho bạn:
    1. Content-Based (tối đa 2)
    2. Collaborative Filtering (tối đa 2)
    3. Popular (bù đắp phần còn thiếu)
    Gắn kèm nhãn reason tương ứng.
    """
    df_tours = get_all_tours()
    if df_tours.empty:
        return []
        
    df_interactions = get_user_interactions()
    
    final_tours = []
    seen_tour_ids = set()
    
    # --- Helper function để thêm tour ---
    def add_tour(tour_id, reason):
        if tour_id not in seen_tour_ids:
            try:
                tour_data = df_tours[df_tours['id'] == tour_id].iloc[0].to_dict()
                tour_data['reason'] = reason
                final_tours.append(tour_data)
                seen_tour_ids.add(tour_id)
                return True
            except IndexError:
                return False
        return False

    booked_tours = []
    recent_tour_id = None
    
    # Nếu user đã đăng nhập và có dữ liệu
    if user_id and not df_interactions.empty:
        user_history = df_interactions[df_interactions['user_id'] == user_id]
        booked_tours = user_history[user_history['interaction_type'] == 'book']['tour_id'].tolist()
        seen_tour_ids.update(booked_tours)  # Loại bỏ tour đã book khỏi gợi ý
        
        if not user_history.empty:
            sorted_history = user_history.sort_values('created_at', ascending=False)
            recent_tour_id = sorted_history.iloc[0]['tour_id']

    # 1. Content-Based (Tối đa 2 tour)
    cb_count = 0
    if recent_tour_id:
        cosine_sim = compute_content_similarity(df_tours)
        if cosine_sim is not None:
            try:
                idx = df_tours.index[df_tours['id'] == recent_tour_id].tolist()[0]
                sim_scores = list(enumerate(cosine_sim[idx]))
                # Bỏ qua chính nó, sắp xếp giảm dần
                sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
                
                for i, score in sim_scores:
                    if cb_count >= 2 or len(final_tours) >= limit:
                        break
                    t_id = df_tours.iloc[i]['id']
                    if t_id != recent_tour_id and t_id not in seen_tour_ids:
                        if add_tour(t_id, "content_based"):
                            cb_count += 1
            except IndexError:
                pass

    # 2. Collaborative Filtering (Tối đa 2 tour)
    cf_count = 0
    if user_id and has_enough_interactions(df_interactions, user_id, min_interactions):
        user_sim_df, df_grouped = compute_user_similarity(df_interactions)
        if user_sim_df is not None and user_id in user_sim_df.index:
            user_interacted = df_grouped[df_grouped['user_id'] == user_id]['tour_id'].tolist()
            similar_users_series = user_sim_df[user_id].drop(user_id)
            similar_users = similar_users_series.sort_values(ascending=False).index.tolist()
            
            for sim_user in similar_users:
                if cf_count >= 2 or len(final_tours) >= limit:
                    break
                sim_user_tours = df_grouped[df_grouped['user_id'] == sim_user]
                # Lấy những tour mà sim_user tương tác cao nhất
                for _, row in sim_user_tours.sort_values('weight', ascending=False).iterrows():
                    t_id = row['tour_id']
                    if t_id not in user_interacted and t_id not in seen_tour_ids:
                        if add_tour(t_id, "collaborative"):
                            cf_count += 1
                            if cf_count >= 2 or len(final_tours) >= limit:
                                break

    # 3. Fallback - Popular Tours (Lấp đầy phần còn thiếu)
    if len(final_tours) < limit:
        # Tính điểm phổ biến: rating * reviews_count
        df_popular = df_tours.copy()
        df_popular['pop_score'] = df_popular['rating'].fillna(0) * df_popular['reviews_count'].fillna(0)
        df_popular = df_popular.sort_values('pop_score', ascending=False)
        
        for _, row in df_popular.iterrows():
            if len(final_tours) >= limit:
                break
            t_id = row['id']
            if t_id not in seen_tour_ids:
                add_tour(t_id, "popular")
                
    return final_tours
