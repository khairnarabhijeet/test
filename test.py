import streamlit as st
import openai

# Set your OpenAI API key
openai.api_key = 'your-api-key-here'

def get_ai_response(prompt):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=150
    )
    return response['choices'][0]['message']['content']

st.title("AI Chatbot for Resume Assistance")

# Input prompt from the user
prompt = st.text_input("Ask me something about my resume:")

if st.button("Get Response"):
    if prompt:
        # Get the AI's response
        response = get_ai_response(prompt)
        st.write(response)
    else:
        st.write("Please enter a prompt.")
