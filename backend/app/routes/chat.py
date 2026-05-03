from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime
from app.database import db
from app.services.llm_gemini import stream_gemini_response

router = APIRouter(prefix="/chat", tags=["Chatbot"])


@router.websocket("/ws")
async def chat_ws(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_json()
            """
            Expected payload:
            {
              "chatId": "frontend-uuid",
              "message": "Hello"
            }
            """

            chat_id = data["chatId"]
            user_message = data["message"]

            # Load existing session
            session = await db.chat_sessions.find_one({"_id": chat_id}) or {}

            # Build history for LLM context (existing messages only)
            history = session.get("chatHistory", [])

            # Append user message to history
            history.append({
                "role": "user",
                "message": user_message,
                "timestamp": datetime.utcnow()
            })

            ai_response = ""

            # Stream from Gemini (async generator)
            async for event in stream_gemini_response(user_message, history[:-1]):
                if event[0] == "token":
                    await websocket.send_text(event[1])
                    ai_response += event[1]

            # Append AI message
            history.append({
                "role": "ai",
                "message": ai_response,
                "timestamp": datetime.utcnow()
            })

            # Keep only last 20 messages
            history = history[-20:]

            # Save session
            await db.chat_sessions.update_one(
                {"_id": chat_id},
                {
                    "$set": {
                        "chatHistory": history,
                        "updated_at": datetime.utcnow(),
                    }
                },
                upsert=True,
            )

            await websocket.send_text("__END__")

    except WebSocketDisconnect:
        print("Chat disconnected")
