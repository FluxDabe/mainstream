Praise The Omnissiah

# Mainstream MVP Frontend for mainstream-main

## Chạy frontend
Mở terminal tại thư mục `frontend`:

```powershell
python -m http.server 5500
uvicorn app.main:app --reload
```

Mở: http://localhost:5500/pages/login.html

## Chạy backend
Chạy FastAPI của `mainstream-main` tại `http://localhost:8000`.

Frontend sử dụng các API:
- `/api/auth/register`
- `/api/auth/login`
- `/api/events`
- `/api/departments`
- `/api/tasks`
- `/api/timeline`
- `/api/reports`

Lưu ý: backend `mainstream-main` hiện không include router AI, nên các chức năng AI sẽ báo chưa sẵn sàng nhưng không làm hỏng MVP chính.
