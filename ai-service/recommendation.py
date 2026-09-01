from fastapi import APIRouter, Query
from typing import Optional
from recommendation_engine import get_recently_viewed, get_personalized_tours

router = APIRouter(prefix="/recommend", tags=["Recommendations"])

@router.get("/recently-viewed")
def recently_viewed(user_id: Optional[int] = Query(None, description="ID của người dùng"), limit: int = Query(4, description="Số lượng tour tối đa trả về")):
    """
    Lấy danh sách tour user đã xem gần nhất.
    Loại bỏ trùng lặp và loại bỏ các tour đã đặt.
    Nếu user chưa đăng nhập hoặc không có lượt xem nào, trả về list rỗng.
    """
    if not user_id:
        return {"recently_viewed": []}
    
    tours = get_recently_viewed(user_id, limit)
    return {"recently_viewed": tours}

@router.get("/personalized")
def personalized(user_id: Optional[int] = Query(None, description="ID của người dùng"), limit: int = Query(4, description="Số lượng tour tối đa trả về")):
    """
    Lấy danh sách 4 tour cá nhân hóa được ưu tiên theo thứ tự:
    1. Content-Based (tối đa 2 tour)
    2. Collaborative Filtering (tối đa 2 tour)
    3. Popular (Fallback lấp đầy)
    Mỗi tour trả về đều kèm theo thuộc tính 'reason' tương ứng.
    """
    tours = get_personalized_tours(user_id, limit)
    return {"personalized": tours}
