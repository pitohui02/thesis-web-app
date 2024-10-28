from flask import Flask, request, jsonify
from flask_cors import CORS 

import numpy as np
import tensorflow as tf
from tensorflow import keras

from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences

import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, TreebankWordTokenizer
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag
from nltk.corpus import wordnet

from symspellpy import SymSpell, Verbosity

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

app = Flask(__name__)
CORS(app)

model_path = 'sentiment_analysis_final.keras'
dictionary_path = 'frequency_dictionary_en_82_765.txt'

model = keras.models.load_model(model_path)


max_words = 15000
max_len = 100


def clean_text(text):
    tree_tokenize = TreebankWordTokenizer()
    text = tree_tokenize.tokenize(text)
    text = ' '.join(text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = re.sub(r'\s{2,}', ' ', text)
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
    tag_dict = {"J": wordnet.ADJ, "N": wordnet.NOUN, "V": wordnet.VERB, "R": wordnet.ADV}
    return tag_dict.get(tag, wordnet.NOUN)

def lemmatize_data(text):
    lemmatize = WordNetLemmatizer()
    words = word_tokenize(text)
    lemmatized_tokens = [
        lemmatize.lemmatize(word, get_wordnet_pos(word))
        for word in words
    ]
    return " ".join(lemmatized_tokens)

negative_words = {
       "no", "not", "nor", "neither", "never", "none", "nobody", "nothing",
       "nowhere", "cannot", "isn't", "wasn't", "aren't", "weren't", "don't",
       "doesn't", "didn't", "hasn't", "haven't", "hadn't", "won't", "wouldn't",
       "can't", "couldn't", "shouldn't", "mightn't", "mustn't", "without"
}

def combine_neg_phrase(text):
    negation_pattern = r'\b(?:' + '|'.join(map(re.escape, negative_words)) + r')\b\s+\w+'
    return re.sub(negation_pattern, lambda match: match.group(0).replace(' ', '_'), text)

def preprocess(text):
    text = clean_text(text)
    text = spell_correction(text)
    text = lemmatize_data(text)
    # text = remove_stopwords(text)
    text = combine_neg_phrase(text)
    return text

tokenizer = Tokenizer(num_words=max_words)

def tokenize_words(text):
    sequences = tokenizer.texts_to_sequences([text])
    return pad_sequences(sequences, maxlen=max_len, padding='pre')[0]


@app.route("/api/predict")
def predict():
    try:
        data = request.get_json()
        if 'text' not in data:
            return jsonify({'error': 'No input provided'}), 400
        
        text = data['text']
        
        cleaned_text = preprocess(text)
        tokenized_text = tokenize_words(clean_text)
        
        prediction = model.predict(np.array[tokenized_text])[0]
        
        label_categories = ['negative', 'neutral', 'positive']
        predicted_label = label_categories[np.argmax(prediction)]
        
        response = {
            'text': text,
            'sentiment': predicted_label,
            'confidence': prediction
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        

if __name__ == "__main__":
    app.run(debug=True, port=5000)