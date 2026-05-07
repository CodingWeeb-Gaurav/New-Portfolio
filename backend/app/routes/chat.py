from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime
from app.database import db
from app.services.llm_gemini import stream_gemini_response

router = APIRouter(prefix="/chat", tags=["Chatbot"])


SYSTEM_PROMPT = """
You are an AI assistant for Gaurav's developer portfolio.

Answer professionally and concisely.
Only answer based on provided context or known info about Gaurav.

If unsure, say you don't know instead of hallucinating.

You help recruiters understand:
- Projects
- Skills
- Experience
- Background
"""


@router.websocket("/ws")
async def chat_ws(websocket: WebSocket):
    await websocket.accept()

    try:
        # 🔹 STEP 1: RECEIVE INITIAL HANDSHAKE (chatId only)
        init_data = await websocket.receive_json()
        chat_id = init_data["chatId"]

        # 🔹 LOAD HISTORY
        session = await db.chat_sessions.find_one({"_id": chat_id}) or {}
        history = session.get("chatHistory", [])

        def serialize_history(history):
            return [
                {
                    "role": msg["role"],
                    "message": msg["message"],
                    "timestamp": msg["timestamp"].isoformat()
                    if "timestamp" in msg else None,
                }
                for msg in history
            ]


        await websocket.send_json({
            "type": "history",
            "messages": serialize_history(history),
        })

        # 🔹 MAIN LOOP
        while True:
            data = await websocket.receive_json()

            user_message = data["message"]

            # 🔹 APPEND USER MESSAGE
            history.append({
                "role": "user",
                "message": user_message,
                "timestamp": datetime.utcnow(),
            })

            # 🔹 LAST 3 MESSAGES ONLY FOR CONTEXT
            last_messages = history[-3:]

            # 🔹 (FUTURE) SEMANTIC SEARCH PLACEHOLDER
            context_chunks = []

            # ======================================================
            # FUTURE: SEMANTIC SEARCH
            # ======================================================
            """
            # Example future code:

            query_embedding = huggingface_embed(user_message)

            context_chunks = semantic_search(
                query_embedding,
                top_k=3
            )

            # returns:
            # ["chunk1 text...", "chunk2...", "chunk3..."]
            """

            ai_response = ""

            # 🔹 STREAM FROM GEMINI
            async for event in stream_gemini_response(
                SYSTEM_PROMPT,
                last_messages,
                user_message,
                context_chunks,
            ):
                if event[0] == "token":
                    await websocket.send_text(event[1])
                    ai_response += event[1]

            # 🔹 SAVE AI RESPONSE
            history.append({
                "role": "ai",
                "message": ai_response,
                "timestamp": datetime.utcnow(),
            })

            history = history[-20:]

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