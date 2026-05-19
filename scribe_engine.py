import os
from dotenv import load_dotenv
from mistralai.client import Mistral

load_dotenv()

api_key = os.getenv("MISTRAL_API_KEY")
model = "mistral-small-latest"
client = Mistral(api_key=api_key)

def process_medical_transcript(raw_text):
    prompt = f"""
        Context: You are an expert Medical Scribe.
        Task: Convert the following messy doctor-patient transcript into a structured JSON.
        Transcript: "{raw_text}"
        Required JSON Format:
        {{
            "patient_concerns": ["list of symptoms"],
            "diagnosis_guess": "string",
            "prescriptions": [{{ "name": "string", "dosage": "string" }}],
            "follow_up": "string"
        }}
    """
    chat_response = client.chat.complete(
        model = model,
        messages = [{"role": "user", "content": prompt}],
        response_format = {"type": "json_object"}
    )

    return chat_response.choices[0].message.content

# messy_convo = """Doctor: What brings you in today?
# Patient: I have pain in my right foot, especially when I walk.
# Doctor: Any injury recently?
# Patient: I twisted it while running yesterday.
# Doctor: You should rest it and apply ice. Take ibuprofen 400mg if needed."""
# print(process_medical_transcript(messy_convo))