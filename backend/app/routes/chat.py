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
            previous_interaction_id = session.get("gemini_chat_id")

            # Append user message
            history = session.get("chatHistory", [])
            history.append({
                "role": "user",
                "message": user_message,
                "timestamp": datetime.utcnow()
            })

            ai_response = ""
            new_interaction_id = None

            # Stream from Gemini
            for event in stream_gemini_response(user_message, previous_interaction_id):
                if event[0] == "token":
                    await websocket.send_text(event[1])
                    ai_response += event[1]

                elif event[0] == "done":
                    new_interaction_id = event[1]

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
                        "gemini_chat_id": new_interaction_id,
                        "chatHistory": history,
                        "updated_at": datetime.utcnow(),
                    }
                },
                upsert=True,
            )

            await websocket.send_text("__END__")

    except WebSocketDisconnect:
        print("Chat disconnected")
