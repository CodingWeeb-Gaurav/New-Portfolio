from google import genai
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL = "gemini-3-flash-preview"


def stream_gemini_response(user_message: str, previous_interaction_id: str | None):
    """
    Yields tokens AND returns (final_text, new_interaction_id)
    """
    stream = client.interactions.create(
        model=MODEL,
        input=user_message,
        previous_interaction_id=previous_interaction_id,
        stream=True,
    )

    full_response = ""
    interaction_id = None

    for chunk in stream:
        if chunk.event_type == "content.delta":
            if chunk.delta.type == "text":
                full_response += chunk.delta.text
                yield ("token", chunk.delta.text)

        elif chunk.event_type == "interaction.complete":
            interaction_id = chunk.interaction.id
            yield ("done", interaction_id, full_response)
