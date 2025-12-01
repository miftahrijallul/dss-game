"""
🎮 DSS Video Games - Backend API
Flask REST API for Video Games Success Prediction
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Get the base directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
DATASET_DIR = os.path.join(BASE_DIR, 'dataset')

# Load models and data
print("Loading models...")
rf_model = joblib.load(os.path.join(MODELS_DIR, 'rf_model.joblib'))
le_platform = joblib.load(os.path.join(MODELS_DIR, 'le_platform.joblib'))
le_genre = joblib.load(os.path.join(MODELS_DIR, 'le_genre.joblib'))
le_publisher = joblib.load(os.path.join(MODELS_DIR, 'le_publisher.joblib'))
scaler = joblib.load(os.path.join(MODELS_DIR, 'scaler.joblib'))
kmeans = joblib.load(os.path.join(MODELS_DIR, 'kmeans.joblib'))

# Load JSON data
with open(os.path.join(MODELS_DIR, 'metadata.json'), 'r') as f:
    metadata = json.load(f)

with open(os.path.join(MODELS_DIR, 'chart_data.json'), 'r') as f:
    chart_data = json.load(f)

with open(os.path.join(MODELS_DIR, 'top_games.json'), 'r') as f:
    top_games = json.load(f)

with open(os.path.join(MODELS_DIR, 'cluster_data.json'), 'r') as f:
    cluster_data = json.load(f)

# Load CSV data
df_clean = pd.read_csv(os.path.join(DATASET_DIR, 'clean_data_video_games.csv'))
df_cluster = pd.read_csv(os.path.join(DATASET_DIR, 'data_with_cluster.csv'))

print("✅ All models and data loaded successfully!")


# ==================== API ROUTES ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "DSS Video Games API is running"
    })


@app.route('/api/metadata', methods=['GET'])
def get_metadata():
    """Get metadata for the frontend"""
    return jsonify(metadata)


@app.route('/api/chart-data', methods=['GET'])
def get_chart_data():
    """Get aggregated chart data"""
    return jsonify(chart_data)


@app.route('/api/top-games', methods=['GET'])
def get_top_games():
    """Get top games by sales"""
    limit = request.args.get('limit', 100, type=int)
    return jsonify(top_games[:limit])


@app.route('/api/games', methods=['GET'])
def get_games():
    """Get games with filters"""
    # Get query parameters
    platform = request.args.get('platform')
    genre = request.args.get('genre')
    publisher = request.args.get('publisher')
    year_min = request.args.get('year_min', type=int)
    year_max = request.args.get('year_max', type=int)
    search = request.args.get('search')
    limit = request.args.get('limit', 100, type=int)
    offset = request.args.get('offset', 0, type=int)
    sort_by = request.args.get('sort_by', 'Global_Sales')
    sort_order = request.args.get('sort_order', 'desc')
    
    # Filter dataframe
    filtered_df = df_clean.copy()
    
    if platform:
        filtered_df = filtered_df[filtered_df['Platform'] == platform]
    if genre:
        filtered_df = filtered_df[filtered_df['Genre'] == genre]
    if publisher:
        filtered_df = filtered_df[filtered_df['Publisher'] == publisher]
    if year_min:
        filtered_df = filtered_df[filtered_df['Year_of_Release'] >= year_min]
    if year_max:
        filtered_df = filtered_df[filtered_df['Year_of_Release'] <= year_max]
    if search:
        filtered_df = filtered_df[filtered_df['Name'].str.contains(search, case=False, na=False)]
    
    # Sort
    ascending = sort_order == 'asc'
    if sort_by in filtered_df.columns:
        filtered_df = filtered_df.sort_values(sort_by, ascending=ascending)
    
    # Get total count before pagination
    total_count = len(filtered_df)
    
    # Paginate
    filtered_df = filtered_df.iloc[offset:offset + limit]
    
    # Convert to records
    games = filtered_df.to_dict('records')
    
    return jsonify({
        "games": games,
        "total": total_count,
        "limit": limit,
        "offset": offset
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict game success"""
    data = request.json
    
    try:
        # Get input values
        platform = data.get('platform')
        genre = data.get('genre')
        publisher = data.get('publisher')
        critic_score = float(data.get('critic_score', 75))
        user_score = float(data.get('user_score', 7.0))
        year = int(data.get('year', 2026))
        
        # Normalize year to training range (2013-2016)
        # Map future years to the training range to maintain model compatibility
        if year >= 2025:
            # Map 2025-2030 to 2014-2016 (recent years in training data)
            normalized_year = 2014 + min((year - 2025) // 2, 2)
        else:
            normalized_year = year
        
        # Encode categorical variables
        try:
            platform_enc = le_platform.transform([platform])[0]
        except:
            platform_enc = 0
        
        try:
            genre_enc = le_genre.transform([genre])[0]
        except:
            genre_enc = 0
        
        try:
            publisher_enc = le_publisher.transform([publisher])[0]
        except:
            publisher_enc = 0
        
        # Create feature array
        features = np.array([[platform_enc, genre_enc, publisher_enc, 
                            critic_score, user_score, normalized_year]])
        
        # Predict
        prediction = rf_model.predict(features)[0]
        probabilities = rf_model.predict_proba(features)[0]
        prob_dict = {cls: float(prob) for cls, prob in zip(rf_model.classes_, probabilities)}
        
        # Generate recommendations
        recommendations = generate_recommendations(prediction, critic_score, user_score, genre, platform)
        
        return jsonify({
            "success": True,
            "prediction": prediction,
            "probabilities": prob_dict,
            "confidence": float(max(probabilities)),
            "recommendations": recommendations,
            "input": {
                "platform": platform,
                "genre": genre,
                "publisher": publisher,
                "critic_score": critic_score,
                "user_score": user_score,
                "year": year
            }
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


def generate_recommendations(prediction, critic_score, user_score, genre, platform):
    """Generate recommendations based on prediction"""
    recommendations = []
    
    if prediction == 'Blockbuster':
        recommendations = [
            {"type": "success", "title": "Excellent Potential!", "message": "This game shows strong blockbuster characteristics."},
            {"type": "info", "title": "Marketing", "message": "Full-scale global marketing campaign recommended."},
            {"type": "info", "title": "Launch Strategy", "message": "Consider platform exclusive deals for maximum impact."},
            {"type": "success", "title": "Investment", "message": "High investment is justified based on projected returns."}
        ]
    elif prediction == 'Hit':
        recommendations = [
            {"type": "success", "title": "Good Potential!", "message": "This game could be a commercial hit."},
            {"type": "info", "title": "Marketing", "message": "Focus marketing on target demographics."},
            {"type": "info", "title": "Launch Strategy", "message": "Multi-platform release recommended."},
            {"type": "warning", "title": "Investment", "message": "Moderate to high investment recommended."}
        ]
    elif prediction == 'Moderate':
        recommendations = [
            {"type": "warning", "title": "Moderate Potential", "message": "Consider improvements to increase success."},
            {"type": "info", "title": "Suggestion", "message": f"Target Critic Score > {metadata['avg_critic_blockbuster']:.0f} for better results."},
            {"type": "info", "title": "Marketing", "message": "Targeted digital marketing recommended."},
            {"type": "warning", "title": "Investment", "message": "Conservative approach recommended."}
        ]
    else:
        recommendations = [
            {"type": "error", "title": "Low Potential", "message": "Major improvements needed for success."},
            {"type": "warning", "title": "Action Required", "message": "Reconsider game design or target market."},
            {"type": "info", "title": "Focus", "message": "Consider niche audience or budget release."},
            {"type": "error", "title": "Investment", "message": "Minimal investment recommended."}
        ]
    
    # Add score-specific recommendations
    if critic_score < 70:
        recommendations.append({
            "type": "warning", 
            "title": "Improve Quality", 
            "message": f"Current Critic Score ({critic_score}) is below average. Focus on polishing gameplay."
        })
    
    if user_score < 6:
        recommendations.append({
            "type": "warning", 
            "title": "User Experience", 
            "message": f"User Score ({user_score}) indicates potential issues. Consider beta testing."
        })
    
    return recommendations


@app.route('/api/cluster-data', methods=['GET'])
def get_cluster_data():
    """Get cluster visualization data with proper structure for frontend"""
    # Cluster labels mapping
    cluster_labels = {
        0: 'Low Performer',
        1: 'Moderate Mid-Tier', 
        2: 'High Sales Hit',
        3: 'Massive Blockbuster'
    }
    
    # Calculate cluster distribution
    cluster_counts = df_cluster['Cluster'].value_counts().to_dict()
    cluster_distribution = [
        {"cluster": k, "label": cluster_labels.get(k, f"Cluster {k}"), "count": v}
        for k, v in sorted(cluster_counts.items())
    ]
    
    # Calculate cluster statistics
    cluster_stats = []
    for cluster_id in sorted(df_cluster['Cluster'].unique()):
        cluster_df = df_cluster[df_cluster['Cluster'] == cluster_id]
        stats = {
            "cluster": int(cluster_id),
            "label": cluster_labels.get(cluster_id, f"Cluster {cluster_id}"),
            "count": int(len(cluster_df)),
            "avg_sales": float(cluster_df['Global_Sales'].mean()),
            "avg_critic": float(cluster_df['Critic_Score'].mean()),
            "avg_user": float(cluster_df['User_Score'].mean()),
            "total_sales": float(cluster_df['Global_Sales'].sum())
        }
        cluster_stats.append(stats)
    
    # Prepare scatter data (sample for performance)
    scatter_sample = df_cluster.sample(min(300, len(df_cluster)), random_state=42)
    scatter_data = scatter_sample[['Name', 'Global_Sales', 'Critic_Score', 'User_Score', 'Cluster', 'Genre', 'Platform']].to_dict('records')
    
    return jsonify({
        "cluster_distribution": cluster_distribution,
        "cluster_stats": cluster_stats,
        "scatter_data": scatter_data
    })


@app.route('/api/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """Get analytics summary"""
    summary = {
        "total_games": len(df_clean),
        "total_sales": float(df_clean['Global_Sales'].sum()),
        "avg_critic_score": float(df_clean['Critic_Score'].mean()),
        "avg_user_score": float(df_clean['User_Score'].mean()),
        "unique_platforms": int(df_clean['Platform'].nunique()),
        "unique_genres": int(df_clean['Genre'].nunique()),
        "unique_publishers": int(df_clean['Publisher'].nunique()),
        "year_range": {
            "min": int(df_clean['Year_of_Release'].min()),
            "max": int(df_clean['Year_of_Release'].max())
        },
        "top_genre": df_clean.groupby('Genre')['Global_Sales'].sum().idxmax(),
        "top_platform": df_clean.groupby('Platform')['Global_Sales'].sum().idxmax(),
        "top_publisher": df_clean.groupby('Publisher')['Global_Sales'].sum().idxmax()
    }
    return jsonify(summary)


@app.route('/api/analytics/genre', methods=['GET'])
def get_genre_analytics():
    """Get genre-specific analytics"""
    genre_stats = df_clean.groupby('Genre').agg({
        'Global_Sales': ['sum', 'mean', 'count'],
        'Critic_Score': 'mean',
        'User_Score': 'mean'
    }).round(2)
    genre_stats.columns = ['total_sales', 'avg_sales', 'game_count', 'avg_critic', 'avg_user']
    genre_stats = genre_stats.reset_index().to_dict('records')
    return jsonify(genre_stats)


@app.route('/api/analytics/platform', methods=['GET'])
def get_platform_analytics():
    """Get platform-specific analytics"""
    platform_stats = df_clean.groupby('Platform').agg({
        'Global_Sales': ['sum', 'mean', 'count'],
        'Critic_Score': 'mean',
        'User_Score': 'mean'
    }).round(2)
    platform_stats.columns = ['total_sales', 'avg_sales', 'game_count', 'avg_critic', 'avg_user']
    platform_stats = platform_stats.reset_index().to_dict('records')
    return jsonify(platform_stats)


@app.route('/api/analytics/yearly', methods=['GET'])
def get_yearly_analytics():
    """Get yearly analytics"""
    yearly_stats = df_clean.groupby('Year_of_Release').agg({
        'Global_Sales': ['sum', 'mean', 'count'],
        'Critic_Score': 'mean',
        'User_Score': 'mean'
    }).round(2)
    yearly_stats.columns = ['total_sales', 'avg_sales', 'game_count', 'avg_critic', 'avg_user']
    yearly_stats = yearly_stats.reset_index()
    yearly_stats['Year_of_Release'] = yearly_stats['Year_of_Release'].astype(int)
    return jsonify(yearly_stats.to_dict('records'))


@app.route('/api/analytics/correlation', methods=['GET'])
def get_correlation():
    """Get correlation matrix"""
    numeric_cols = ['NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales', 'Global_Sales', 'Critic_Score', 'User_Score']
    corr = df_clean[numeric_cols].corr().round(3).to_dict()
    return jsonify(corr)


@app.route('/api/analytics/rules', methods=['GET'])
def get_association_rules():
    """Get association rules data"""
    try:
        rules_path = os.path.join(DATASET_DIR, 'rules_success_factors.csv')
        if os.path.exists(rules_path):
            rules_df = pd.read_csv(rules_path)
            # Format rules for frontend - handle Indonesian column names
            rules_list = []
            for _, row in rules_df.head(20).iterrows():
                # Try different possible column names
                antecedent = str(row.get('Sebab (Antecedents)', 
                               row.get('antecedents', 
                               row.get('antecedent', 'N/A'))))
                consequent = str(row.get('Akibat (Consequents)', 
                               row.get('consequents', 
                               row.get('consequent', 'N/A'))))
                
                # Clean up the text - remove frozenset formatting if present
                antecedent = antecedent.replace("frozenset({", "").replace("})", "").replace("'", "")
                consequent = consequent.replace("frozenset({", "").replace("})", "").replace("'", "")
                
                rules_list.append({
                    "antecedent": antecedent,
                    "consequent": consequent,
                    "support": float(row.get('support', 0)),
                    "confidence": float(row.get('confidence', 0)),
                    "lift": float(row.get('lift', 0))
                })
            return jsonify(rules_list)
        else:
            return jsonify([])
    except Exception as e:
        print(f"Error loading rules: {e}")
        return jsonify([])


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🎮 DSS Video Games API")
    print("="*60)
    print(f"📊 Loaded {len(df_clean)} games")
    print(f"🎯 Model Accuracy: {metadata['model_accuracy']:.1%}")
    print("="*60 + "\n")
    
    app.run(debug=True, port=5000, host='0.0.0.0')
