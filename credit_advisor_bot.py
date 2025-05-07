import json
import pandas as pd
from typing import List, Dict
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from transformers import AutoModelForCausalLM, AutoTokenizer
from langchain.memory import ConversationBufferMemory
from langchain.llms import HuggingFaceHub

class CreditAdvisorBot:
    def __init__(self, data_path: str, is_excel: bool = False):
        # Initialize the model and tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained("gpt2")
        self.model = AutoModelForCausalLM.from_pretrained("gpt2")
        
        # Load and process the knowledge base
        self.knowledge_base = self._load_knowledge_base(data_path, is_excel)
        self.vector_store = self._create_vector_store()
        
        # Initialize conversation memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Initialize the conversation chain
        self.qa_chain = self._setup_qa_chain()

    def _load_knowledge_base(self, data_path: str, is_excel: bool) -> List[Dict]:
        if is_excel:
            df = pd.read_excel(data_path)
            return df.to_dict('records')
        else:
            with open(data_path, 'r') as file:
                return json.load(file)

    def _create_vector_store(self):
        # Convert knowledge base to documents
        text_splitter = CharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        texts = []
        for item in self.knowledge_base:
            texts.extend(text_splitter.split_text(str(item)))
        
        # Create embeddings and vector store
        embeddings = HuggingFaceEmbeddings()
        return FAISS.from_texts(texts, embeddings)

    def _setup_qa_chain(self):
        return ConversationalRetrievalChain.from_llm(
            llm=HuggingFaceHub(repo_id="gpt2", model_kwargs={"temperature": 0.5}),
            retriever=self.vector_store.as_retriever(),
            memory=self.memory
        )

    def ask_question(self, question: str) -> str:
        response = self.qa_chain({"question": question})
        return response['answer']

    def questionnaire(self):
        questions = [
            "What is your current credit score?",
            "What is your annual income?",
            "Do you have any existing loans?",
            "What is your monthly debt payment?",
            "What type of credit advice are you looking for?"
        ]
        
        responses = {}
        for question in questions:
            user_input = input(f"\n{question}\n> ")
            responses[question] = user_input
            
            # Generate contextual response based on user input
            context = f"Based on the user's response that {question}: {user_input}"
            bot_response = self.ask_question(context)
            print(f"\nBot: {bot_response}")
        
        return responses

def main():
    # Initialize the bot with your knowledge base
    # You can use either JSON or Excel file
    bot = CreditAdvisorBot(
        data_path="creditAdvisor.json",  # or "creditAdvisor.xlsx"
        is_excel=False
    )
    
    print("Welcome to the Credit Advisor Bot!")
    print("Let's start with some questions to better understand your situation.")
    
    # Run the questionnaire
    responses = bot.questionnaire()
    
    # Continue with open-ended conversation
    while True:
        user_input = input("\nYou can ask any credit-related question (or type 'exit' to quit):\n> ")
        
        if user_input.lower() == 'exit':
            break
            
        response = bot.ask_question(user_input)
        print(f"\nBot: {response}")

if __name__ == "__main__":
    main()