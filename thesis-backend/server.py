from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

import pickle
import os

import numpy as np
import tensorflow as tf
from tensorflow import keras

from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

from collections import Counter

import re
import nltk
import json

nltk.download("punkt")
nltk.download("punkt_tab")
nltk.download("wordnet")
nltk.download("omw-1.4")
nltk.download("stopwords")
nltk.download("averaged_perceptron_tagger")
nltk.download("averaged_perceptron_tagger_eng")

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, TreebankWordTokenizer
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag
from nltk.corpus import wordnet

from symspellpy import SymSpell, Verbosity


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "https://thesis-web-app-sa6k.onrender.com"}})

model_path = "final_model.keras"
dictionary_path = "frequency_dictionary_en_82_765.txt"
tokenizer_path = "tokenizer.pickle"

model = keras.models.load_model(model_path)


max_words = 15000
max_len = 100

if os.path.exists(tokenizer_path):
    print("Loading saved tokenizer...")
    with open(tokenizer_path, "rb") as handle:
        tokenizer = pickle.load(handle)
else:
    print(
        "ERROR: Tokenizer file not found! Please run the training code first to generate the tokenizer.pickle file"
    )
    # Initialize an empty tokenizer as fallback (not recommended for production)
    tokenizer = Tokenizer(num_words=max_words)


def clean_text(text):
    tree_tokenize = TreebankWordTokenizer()
    text = tree_tokenize.tokenize(text)
    text = " ".join(text)
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    text = re.sub(r"\s{2,}", " ", text)
    text = text.strip()
    return text.lower()

sym_spell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)
sym_spell.load_dictionary(dictionary_path, term_index=0, count_index=1)


def spell_correction(text):
    corrected_text = []
    for word in word_tokenize(text):
        suggestions = sym_spell.lookup(word, Verbosity.CLOSEST, max_edit_distance=2)
        corrected_word = suggestions[0].term if suggestions else word
        corrected_text.append(corrected_word)
    return " ".join(corrected_text)


def get_wordnet_pos(word):
    tag = pos_tag([word])[0][1][0].upper()  # Get first letter of POS tag
    tag_dict = {
        "J": wordnet.ADJ,
        "N": wordnet.NOUN,
        "V": wordnet.VERB,
        "R": wordnet.ADV,
    }
    return tag_dict.get(tag, wordnet.NOUN)


def lemmatize_data(text):
    lemmatize = WordNetLemmatizer()
    words = word_tokenize(text)
    lemmatized_tokens = [
        lemmatize.lemmatize(word, get_wordnet_pos(word)) for word in words
    ]
    return " ".join(lemmatized_tokens)


negative_words = {
    "no",
    "not",
    "nor",
    "neither",
    "never",
    "none",
    "nobody",
    "nothing",
    "nowhere",
    "cannot",
    "isn't",
    "wasn't",
    "aren't",
    "weren't",
    "don't",
    "doesn't",
    "didn't",
    "hasn't",
    "haven't",
    "hadn't",
    "won't",
    "wouldn't",
    "can't",
    "couldn't",
    "shouldn't",
    "mightn't",
    "mustn't",
    "without",
}

stop_words = set(stopwords.words('english')) - negative_words

def remove_stopwords(text):
    words = word_tokenize(text)
    filtered_words = [word for word in words if word not in stop_words]
    return ' '.join(filtered_words)


def combine_neg_phrase(text):
    negation_pattern = (
        r"\b(?:" + "|".join(map(re.escape, negative_words)) + r")\b\s+\w+"
    )
    return re.sub(
        negation_pattern, lambda match: match.group(0).replace(" ", "_"), text
    )


def preprocess(text):
    text = clean_text(text)
    text = spell_correction(text)
    text = lemmatize_data(text)
    # text = remove_stopwords(text)
    text = combine_neg_phrase(text)
    return text


# tokenizer = Tokenizer(num_words=max_words)

def tokenize_words(text):
    sequences = tokenizer.texts_to_sequences([text])
    return pad_sequences(sequences, maxlen=max_len, padding="pre")[0]

@cross_origin(origins="https://thesis-web-app-sa6k.onrender.com", supports_credentials=True)
@app.route("/api/word-frequency", methods=["POST", "OPTIONS"])
def get_word_frequency():
    if request.method == "OPTIONS":
        return '', 200
    try:
        data = request.get_json()
        if "text" not in data:
            return jsonify({"error": "No input provided"}), 400
            
        text = data["text"]
        cleaned_text = remove_stopwords(text)
        
        # Split into words and count frequencies
        words = cleaned_text.split()
        word_freq = Counter(words)
        
        # Convert to sorted list of (word, count) pairs
        sorted_freq = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        
        # Get top 20 most frequent words
        top_words = sorted_freq[:20]
        
        response = {
            "frequency_data": [
                {"word": word, "count": count} 
                for word, count in top_words
            ]
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500

@cross_origin(origins="https://thesis-web-app-sa6k.onrender.com", supports_credentials=True)
@app.route("/api/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return '', 200
    try:
        data = request.get_json()
        if "text" not in data:
            return jsonify({"error": "No input provided"}), 400

        text = data["text"]
        print(f"Original text: {text}")  # Debug print

        cleaned_text = preprocess(text)
        print(f"After preprocessing: {cleaned_text}")  # Debug print

        print(f"Tokenizer vocabulary size: {len(tokenizer.word_index)}")
        word_sequences = tokenizer.texts_to_sequences([cleaned_text])
        print(f"Word sequences before padding: {word_sequences}")

        tokenized_text = tokenize_words(cleaned_text)
        print(f"Tokenized shape: {tokenized_text.shape}")  # Debug print
        print(
            f"Tokenized text (first few tokens): {tokenized_text[:10]}"
        )  # Debug print

        # Convert to batch format and check input shape
        input_tensor = np.array([tokenized_text])
        print(f"Input tensor shape: {input_tensor.shape}")  # Debug print

        prediction = model.predict(input_tensor, verbose=0)[0]
        print(f"Raw prediction: {prediction}")  # Debug print

        label_categories = ["Negative", "Neutral", "Positive"]
        predicted_label = label_categories[np.argmax(prediction)]
        print(f"Predicted label: {predicted_label}")  # Debug print

        response = {
            "text": text,
            "preprocessed_text": cleaned_text,  # Adding preprocessed text to response
            "sentiment": predicted_label,
            "confidence": prediction.tolist(),
        }

        return jsonify(response)

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Debug print
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"})


if __name__ == "__main__":
    # Print model summary and configuration
    print("\nModel Summary:")
    model.summary()

    # Print tokenizer configuration
    print("\nTokenizer Configuration:")
    print(f"Max words: {max_words}")
    print(f"Max length: {max_len}")

    app.run(host="0.0.0.0", port=os.getenv("PORT", 5000))
