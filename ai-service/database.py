import mysql.connector
import pandas as pd
import os
from dotenv import load_dotenv

# Load .env from backend directory
env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
load_dotenv(dotenv_path=env_path)

def get_db_connection():
    """Tạo kết nối tới database MySQL."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "travel_booking"),
        port=int(os.getenv("DB_PORT", 3306))
    )

def get_all_tours():
    """
    Lấy danh sách tất cả các tour với thông tin chi tiết (thể loại, vùng miền, tags).
    Dùng để tính toán TF-IDF (Content-Based) và fallback (Popular).
    """
    conn = get_db_connection()
    query = """
        SELECT t.id, t.name, t.price, t.rating, t.reviews_count, t.image, t.created_at, t.badge,
            COALESCE(c.name, '') as category, 
            COALESCE(r.name, '') as region, 
            COALESCE(d.name, '') as province,
            (SELECT GROUP_CONCAT(tt.name SEPARATOR ',') 
             FROM tour_tourtype ttt 
             JOIN tourtype tt ON ttt.type_id = tt.id 
             WHERE ttt.tour_id = t.id) as tags
        FROM tours t
        LEFT JOIN tour_destination td ON t.id = td.tour_id AND td.is_primary = TRUE
        LEFT JOIN destination d ON td.destination_id = d.id
        LEFT JOIN country co ON d.country_id = co.id
        LEFT JOIN region r ON r.id = COALESCE(d.region_id, co.region_id)
        LEFT JOIN tourcategory c ON r.category_id = c.id
    """
    df_tours = pd.read_sql(query, conn)
    conn.close()
    return df_tours

def get_user_interactions():
    """
    Lấy danh sách tương tác của tất cả user (view, book).
    Dùng để tính toán Collaborative Filtering và Recently Viewed.
    """
    conn = get_db_connection()
    query = "SELECT user_id, tour_id, interaction_type, weight, created_at FROM user_interactions"
    df_interactions = pd.read_sql(query, conn)
    conn.close()
    return df_interactions
