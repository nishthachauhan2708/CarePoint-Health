from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.analytics import NotificationOut, NotificationCreate
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationOut])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()
    
    return [
        NotificationOut(
            id=n.id,
            user_id=n.user_id,
            title=n.title,
            message=n.message,
            type=n.type,
            is_read=n.is_read,
            created_at=n.created_at
        )
        for n in notifications
    ]

@router.patch("/{id}/read", response_model=NotificationOut)
def mark_notification_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(Notification.id == id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notif.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return NotificationOut(
        id=notif.id,
        user_id=notif.user_id,
        title=notif.title,
        message=notif.message,
        type=notif.type,
        is_read=notif.is_read,
        created_at=notif.created_at
    )

@router.post("/broadcast", status_code=status.HTTP_201_CREATED)
def broadcast_notification(
    notif_in: NotificationCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(["admin"]))
):
    # Broadcast to all active users
    users = db.query(User).filter(User.is_active == True).all()
    created = []
    for u in users:
        n = Notification(
            user_id=u.id,
            title=notif_in.title,
            message=notif_in.message,
            type=notif_in.type
        )
        db.add(n)
        created.append(n)
    db.commit()
    return {"message": f"Broadcast delivered to {len(created)} users successfully"}
