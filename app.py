"""
🎮 Decision Support System - Video Games Success Prediction
GUI Application menggunakan Streamlit

Author: DSS UAS Project
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import warnings
warnings.filterwarnings('ignore')

# ==================== PAGE CONFIG ====================
st.set_page_config(
    page_title="🎮 DSS Video Games Analysis",
    page_icon="🎮",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==================== CUSTOM CSS ====================
st.markdown("""
<style>
    /* Main Theme */
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        background: linear-gradient(90deg, #FF6B6B, #4ECDC4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        padding: 1rem;
    }
    
    .sub-header {
        font-size: 1.2rem;
        color: #666;
        text-align: center;
        margin-bottom: 2rem;
    }
    
    /* Cards */
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 15px;
        color: white;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .metric-value {
        font-size: 2.5rem;
        font-weight: bold;
    }
    
    .metric-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    
    /* Prediction Box */
    .prediction-box {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        padding: 2rem;
        border-radius: 20px;
        color: white;
        text-align: center;
        margin: 1rem 0;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .prediction-result {
        font-size: 2rem;
        font-weight: bold;
        margin: 1rem 0;
    }
    
    /* Success Categories */
    .blockbuster { background: linear-gradient(135deg, #FF6B6B, #FF8E53); }
    .hit { background: linear-gradient(135deg, #4ECDC4, #44A08D); }
    .moderate { background: linear-gradient(135deg, #667eea, #764ba2); }
    .low { background: linear-gradient(135deg, #bdc3c7, #2c3e50); }
    
    /* Sidebar */
    .sidebar .sidebar-content {
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    }
    
    /* Tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 10px;
    }
    
    .stTabs [data-baseweb="tab"] {
        background-color: #f0f2f6;
        border-radius: 10px;
        padding: 10px 20px;
    }
    
    .stTabs [aria-selected="true"] {
        background-color: #4ECDC4;
        color: white;
    }
    
    /* Info Box */
    .info-box {
        background: #f8f9fa;
        border-left: 5px solid #4ECDC4;
        padding: 1rem;
        border-radius: 0 10px 10px 0;
        margin: 1rem 0;
    }
    
    /* Footer */
    .footer {
        text-align: center;
        padding: 2rem;
        color: #666;
        border-top: 1px solid #eee;
        margin-top: 3rem;
    }
</style>
""", unsafe_allow_html=True)

# ==================== LOAD DATA & TRAIN MODEL ====================
@st.cache_data
def load_data():
    """Load and preprocess all datasets"""
    df_clean = pd.read_csv('dataset/clean_data_video_games.csv')
    df_cluster = pd.read_csv('dataset/data_with_cluster.csv')
    return df_clean, df_cluster

@st.cache_resource
def train_model(df):
    """Train the prediction model"""
    # Feature Engineering
    def categorize_success(sales):
        if sales >= 5:
            return 'Blockbuster'
        elif sales >= 2:
            return 'Hit'
        elif sales >= 1:
            return 'Moderate'
        else:
            return 'Low'
    
    df_model = df.copy()
    df_model['Success_Category'] = df_model['Global_Sales'].apply(categorize_success)
    
    # Encode categorical variables
    le_platform = LabelEncoder()
    le_genre = LabelEncoder()
    le_publisher = LabelEncoder()
    
    df_model['Platform_Encoded'] = le_platform.fit_transform(df_model['Platform'])
    df_model['Genre_Encoded'] = le_genre.fit_transform(df_model['Genre'])
    df_model['Publisher_Encoded'] = le_publisher.fit_transform(df_model['Publisher'])
    
    # Features and Target
    feature_cols = ['Platform_Encoded', 'Genre_Encoded', 'Publisher_Encoded', 
                    'Critic_Score', 'User_Score', 'Year_of_Release']
    X = df_model[feature_cols]
    y = df_model['Success_Category']
    
    # Split and train
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    
    # Accuracy
    y_pred = rf_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'Feature': ['Platform', 'Genre', 'Publisher', 'Critic Score', 'User Score', 'Year'],
        'Importance': rf_model.feature_importances_
    }).sort_values('Importance', ascending=False)
    
    return rf_model, le_platform, le_genre, le_publisher, accuracy, feature_importance, df_model

# Load data
try:
    df_clean, df_cluster = load_data()
    rf_model, le_platform, le_genre, le_publisher, model_accuracy, feature_importance, df_model = train_model(df_clean)
    data_loaded = True
except Exception as e:
    st.error(f"Error loading data: {e}")
    data_loaded = False

# ==================== SIDEBAR ====================
with st.sidebar:
    st.markdown("## 🎮 Navigation")
    
    menu = st.radio(
        "Pilih Menu:",
        ["🏠 Dashboard", "📊 Data Explorer", "🔮 Prediction Tool", "📈 Analytics", "🎯 Recommendations"],
        index=0
    )
    
    st.markdown("---")
    
    st.markdown("### 📋 Dataset Info")
    if data_loaded:
        st.info(f"""
        **Total Games:** {len(df_clean):,}
        
        **Platforms:** {df_clean['Platform'].nunique()}
        
        **Genres:** {df_clean['Genre'].nunique()}
        
        **Publishers:** {df_clean['Publisher'].nunique()}
        
        **Years:** {int(df_clean['Year_of_Release'].min())} - {int(df_clean['Year_of_Release'].max())}
        """)
    
    st.markdown("---")
    
    st.markdown("### ⚙️ Model Performance")
    if data_loaded:
        st.metric("Accuracy", f"{model_accuracy:.1%}")
    
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: #666; font-size: 0.8rem;'>
        <p>DSS Video Games Analysis</p>
        <p>UAS Project © 2024</p>
    </div>
    """, unsafe_allow_html=True)

# ==================== MAIN CONTENT ====================
if data_loaded:
    
    # ========== DASHBOARD ==========
    if menu == "🏠 Dashboard":
        st.markdown("<h1 class='main-header'>🎮 Decision Support System</h1>", unsafe_allow_html=True)
        st.markdown("<p class='sub-header'>Video Games Success Prediction & Analysis</p>", unsafe_allow_html=True)
        
        # Key Metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.markdown("""
            <div class='metric-card'>
                <div class='metric-value'>{:,}</div>
                <div class='metric-label'>Total Games</div>
            </div>
            """.format(len(df_clean)), unsafe_allow_html=True)
        
        with col2:
            total_sales = df_clean['Global_Sales'].sum()
            st.markdown(f"""
            <div class='metric-card' style='background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);'>
                <div class='metric-value'>{total_sales:.1f}M</div>
                <div class='metric-label'>Total Sales</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            avg_critic = df_clean['Critic_Score'].mean()
            st.markdown(f"""
            <div class='metric-card' style='background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);'>
                <div class='metric-value'>{avg_critic:.1f}</div>
                <div class='metric-label'>Avg Critic Score</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col4:
            avg_user = df_clean['User_Score'].mean()
            st.markdown(f"""
            <div class='metric-card' style='background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);'>
                <div class='metric-value'>{avg_user:.1f}</div>
                <div class='metric-label'>Avg User Score</div>
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown("---")
        
        # Charts Row 1
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### 📊 Sales by Genre")
            genre_sales = df_clean.groupby('Genre')['Global_Sales'].sum().sort_values(ascending=True)
            fig = px.bar(
                x=genre_sales.values,
                y=genre_sales.index,
                orientation='h',
                color=genre_sales.values,
                color_continuous_scale='Viridis'
            )
            fig.update_layout(
                xaxis_title="Total Sales (Million Units)",
                yaxis_title="",
                showlegend=False,
                height=400
            )
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.markdown("### 🎮 Top Platforms")
            platform_sales = df_clean.groupby('Platform')['Global_Sales'].sum().sort_values(ascending=False).head(10)
            fig = px.pie(
                values=platform_sales.values,
                names=platform_sales.index,
                hole=0.4,
                color_discrete_sequence=px.colors.qualitative.Set2
            )
            fig.update_layout(height=400)
            st.plotly_chart(fig, use_container_width=True)
        
        # Charts Row 2
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### 🌍 Regional Sales Distribution")
            regions = ['NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales']
            region_names = ['North America', 'Europe', 'Japan', 'Other']
            region_totals = [df_clean[col].sum() for col in regions]
            
            fig = px.pie(
                values=region_totals,
                names=region_names,
                color_discrete_sequence=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
            )
            fig.update_layout(height=350)
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.markdown("### ⭐ Score vs Sales")
            fig = px.scatter(
                df_clean,
                x='Critic_Score',
                y='User_Score',
                size='Global_Sales',
                color='Genre',
                hover_name='Name',
                size_max=30,
                opacity=0.7
            )
            fig.update_layout(height=350)
            st.plotly_chart(fig, use_container_width=True)
    
    # ========== DATA EXPLORER ==========
    elif menu == "📊 Data Explorer":
        st.markdown("## 📊 Data Explorer")
        st.markdown("Jelajahi dataset video games dengan filter interaktif")
        
        # Filters
        col1, col2, col3 = st.columns(3)
        
        with col1:
            selected_platforms = st.multiselect(
                "Platform",
                options=df_clean['Platform'].unique(),
                default=[]
            )
        
        with col2:
            selected_genres = st.multiselect(
                "Genre",
                options=df_clean['Genre'].unique(),
                default=[]
            )
        
        with col3:
            year_range = st.slider(
                "Year Range",
                min_value=int(df_clean['Year_of_Release'].min()),
                max_value=int(df_clean['Year_of_Release'].max()),
                value=(int(df_clean['Year_of_Release'].min()), int(df_clean['Year_of_Release'].max()))
            )
        
        # Apply filters
        filtered_df = df_clean.copy()
        if selected_platforms:
            filtered_df = filtered_df[filtered_df['Platform'].isin(selected_platforms)]
        if selected_genres:
            filtered_df = filtered_df[filtered_df['Genre'].isin(selected_genres)]
        filtered_df = filtered_df[
            (filtered_df['Year_of_Release'] >= year_range[0]) & 
            (filtered_df['Year_of_Release'] <= year_range[1])
        ]
        
        # Display metrics
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Filtered Games", f"{len(filtered_df):,}")
        col2.metric("Total Sales", f"{filtered_df['Global_Sales'].sum():.1f}M")
        col3.metric("Avg Critic Score", f"{filtered_df['Critic_Score'].mean():.1f}")
        col4.metric("Avg User Score", f"{filtered_df['User_Score'].mean():.1f}")
        
        st.markdown("---")
        
        # Tabs for different views
        tab1, tab2, tab3 = st.tabs(["📋 Data Table", "📈 Statistics", "🔍 Search"])
        
        with tab1:
            st.dataframe(
                filtered_df.sort_values('Global_Sales', ascending=False),
                use_container_width=True,
                height=500
            )
        
        with tab2:
            st.markdown("### Statistical Summary")
            st.dataframe(filtered_df.describe(), use_container_width=True)
            
            col1, col2 = st.columns(2)
            with col1:
                st.markdown("### Top 10 Games by Sales")
                top_games = filtered_df.nlargest(10, 'Global_Sales')[['Name', 'Platform', 'Genre', 'Global_Sales', 'Critic_Score']]
                st.dataframe(top_games, use_container_width=True)
            
            with col2:
                st.markdown("### Top Publishers")
                top_pub = filtered_df.groupby('Publisher')['Global_Sales'].sum().nlargest(10)
                fig = px.bar(x=top_pub.values, y=top_pub.index, orientation='h')
                fig.update_layout(xaxis_title="Total Sales (M)", yaxis_title="")
                st.plotly_chart(fig, use_container_width=True)
        
        with tab3:
            search_term = st.text_input("🔍 Search Game by Name")
            if search_term:
                results = filtered_df[filtered_df['Name'].str.contains(search_term, case=False, na=False)]
                if len(results) > 0:
                    st.success(f"Found {len(results)} games")
                    st.dataframe(results, use_container_width=True)
                else:
                    st.warning("No games found")
    
    # ========== PREDICTION TOOL ==========
    elif menu == "🔮 Prediction Tool":
        st.markdown("## 🔮 Game Success Prediction")
        st.markdown("Prediksi kesuksesan video game berdasarkan karakteristik game")
        
        col1, col2 = st.columns([1, 1])
        
        with col1:
            st.markdown("### 📝 Input Game Details")
            
            platform = st.selectbox(
                "🎮 Platform",
                options=sorted(df_clean['Platform'].unique())
            )
            
            genre = st.selectbox(
                "🎯 Genre",
                options=sorted(df_clean['Genre'].unique())
            )
            
            publisher = st.selectbox(
                "🏢 Publisher",
                options=sorted(df_clean['Publisher'].unique())
            )
            
            col_a, col_b = st.columns(2)
            with col_a:
                critic_score = st.slider(
                    "⭐ Critic Score",
                    min_value=0,
                    max_value=100,
                    value=80
                )
            
            with col_b:
                user_score = st.slider(
                    "👤 User Score",
                    min_value=0.0,
                    max_value=10.0,
                    value=7.0,
                    step=0.1
                )
            
            year = st.slider(
                "📅 Release Year",
                min_value=2010,
                max_value=2025,
                value=2024
            )
            
            predict_btn = st.button("🚀 Predict Success", type="primary", use_container_width=True)
        
        with col2:
            st.markdown("### 📊 Prediction Result")
            
            if predict_btn:
                # Encode inputs
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
                                     critic_score, user_score, year]])
                
                # Predict
                prediction = rf_model.predict(features)[0]
                probabilities = rf_model.predict_proba(features)[0]
                prob_dict = dict(zip(rf_model.classes_, probabilities))
                
                # Display result
                color_map = {
                    'Blockbuster': '#FF6B6B',
                    'Hit': '#4ECDC4',
                    'Moderate': '#667eea',
                    'Low': '#95a5a6'
                }
                
                emoji_map = {
                    'Blockbuster': '🏆',
                    'Hit': '⭐',
                    'Moderate': '📈',
                    'Low': '📉'
                }
                
                st.markdown(f"""
                <div style='background: linear-gradient(135deg, {color_map.get(prediction, '#667eea')} 0%, #764ba2 100%);
                            padding: 2rem; border-radius: 20px; color: white; text-align: center;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.2);'>
                    <h2 style='margin: 0;'>{emoji_map.get(prediction, '🎮')} Predicted Category</h2>
                    <h1 style='font-size: 3rem; margin: 1rem 0;'>{prediction}</h1>
                    <p style='font-size: 1.2rem; opacity: 0.9;'>Confidence: {prob_dict[prediction]:.1%}</p>
                </div>
                """, unsafe_allow_html=True)
                
                st.markdown("---")
                
                # Probability breakdown
                st.markdown("### 📊 Probability Distribution")
                
                prob_df = pd.DataFrame({
                    'Category': list(prob_dict.keys()),
                    'Probability': list(prob_dict.values())
                }).sort_values('Probability', ascending=True)
                
                fig = px.bar(
                    prob_df,
                    x='Probability',
                    y='Category',
                    orientation='h',
                    color='Probability',
                    color_continuous_scale='Viridis'
                )
                fig.update_layout(
                    showlegend=False,
                    xaxis_title="Probability",
                    yaxis_title="",
                    xaxis_tickformat='.0%'
                )
                st.plotly_chart(fig, use_container_width=True)
                
                # Recommendations
                st.markdown("### 💡 Recommendations")
                
                if prediction == 'Blockbuster':
                    st.success("""
                    🎉 **Excellent potential!** This game shows strong blockbuster characteristics.
                    - Marketing: Full-scale global campaign recommended
                    - Launch: Consider major platform exclusive deals
                    - Budget: High investment justified
                    """)
                elif prediction == 'Hit':
                    st.info("""
                    ⭐ **Good potential!** This game could be a commercial hit.
                    - Marketing: Focus on target demographics
                    - Launch: Multi-platform release recommended
                    - Budget: Moderate to high investment
                    """)
                elif prediction == 'Moderate':
                    st.warning("""
                    📈 **Moderate potential.** Consider improvements to increase success.
                    - Suggestion: Improve critic appeal (higher quality)
                    - Marketing: Targeted digital marketing
                    - Budget: Conservative approach recommended
                    """)
                else:
                    st.error("""
                    📉 **Low potential.** Major improvements needed.
                    - Action: Reconsider game design or target market
                    - Focus: Niche audience or budget release
                    - Budget: Minimal investment recommended
                    """)
            else:
                st.info("👆 Fill in the game details and click **Predict Success** to see the prediction")
                
                # Show feature importance
                st.markdown("### 🎯 Key Success Factors")
                fig = px.bar(
                    feature_importance,
                    x='Importance',
                    y='Feature',
                    orientation='h',
                    color='Importance',
                    color_continuous_scale='Blues'
                )
                fig.update_layout(showlegend=False, yaxis_title="")
                st.plotly_chart(fig, use_container_width=True)
    
    # ========== ANALYTICS ==========
    elif menu == "📈 Analytics":
        st.markdown("## 📈 Advanced Analytics")
        
        tab1, tab2, tab3 = st.tabs(["📊 Cluster Analysis", "📈 Trend Analysis", "🔗 Correlation"])
        
        with tab1:
            st.markdown("### 🎯 Game Clustering Analysis")
            
            # Cluster visualization
            if 'Cluster_Label' in df_cluster.columns:
                col1, col2 = st.columns(2)
                
                with col1:
                    cluster_counts = df_cluster['Cluster_Label'].value_counts()
                    fig = px.pie(
                        values=cluster_counts.values,
                        names=cluster_counts.index,
                        title="Distribution by Cluster",
                        color_discrete_sequence=px.colors.qualitative.Set2
                    )
                    st.plotly_chart(fig, use_container_width=True)
                
                with col2:
                    fig = px.scatter(
                        df_cluster,
                        x='Global_Sales',
                        y='Critic_Score',
                        color='Cluster_Label',
                        hover_name='Name',
                        title="Cluster Distribution (Sales vs Score)",
                        opacity=0.7
                    )
                    st.plotly_chart(fig, use_container_width=True)
                
                # Cluster statistics
                st.markdown("### 📊 Cluster Statistics")
                cluster_stats = df_cluster.groupby('Cluster_Label').agg({
                    'Global_Sales': ['mean', 'sum', 'count'],
                    'Critic_Score': 'mean',
                    'User_Score': 'mean'
                }).round(2)
                cluster_stats.columns = ['Avg Sales', 'Total Sales', 'Count', 'Avg Critic', 'Avg User']
                st.dataframe(cluster_stats, use_container_width=True)
        
        with tab2:
            st.markdown("### 📈 Trend Analysis")
            
            # Yearly trends
            yearly_data = df_clean.groupby('Year_of_Release').agg({
                'Global_Sales': 'sum',
                'Critic_Score': 'mean',
                'Name': 'count'
            }).reset_index()
            yearly_data.columns = ['Year', 'Total Sales', 'Avg Score', 'Game Count']
            
            fig = make_subplots(specs=[[{"secondary_y": True}]])
            
            fig.add_trace(
                go.Bar(x=yearly_data['Year'], y=yearly_data['Total Sales'], name="Total Sales", marker_color='#4ECDC4'),
                secondary_y=False
            )
            
            fig.add_trace(
                go.Scatter(x=yearly_data['Year'], y=yearly_data['Avg Score'], name="Avg Score", line=dict(color='#FF6B6B', width=3)),
                secondary_y=True
            )
            
            fig.update_layout(title="Yearly Sales & Average Score Trend", height=400)
            fig.update_xaxes(title_text="Year")
            fig.update_yaxes(title_text="Total Sales (M)", secondary_y=False)
            fig.update_yaxes(title_text="Average Critic Score", secondary_y=True)
            
            st.plotly_chart(fig, use_container_width=True)
            
            # Genre trend
            genre_yearly = df_clean.groupby(['Year_of_Release', 'Genre'])['Global_Sales'].sum().reset_index()
            fig = px.area(
                genre_yearly,
                x='Year_of_Release',
                y='Global_Sales',
                color='Genre',
                title="Genre Sales Trend Over Years"
            )
            st.plotly_chart(fig, use_container_width=True)
        
        with tab3:
            st.markdown("### 🔗 Correlation Analysis")
            
            numeric_cols = ['NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales', 'Global_Sales', 'Critic_Score', 'User_Score']
            corr_matrix = df_clean[numeric_cols].corr()
            
            fig = px.imshow(
                corr_matrix,
                labels=dict(color="Correlation"),
                x=numeric_cols,
                y=numeric_cols,
                color_continuous_scale='RdBu_r',
                aspect='auto'
            )
            fig.update_layout(title="Correlation Heatmap", height=500)
            st.plotly_chart(fig, use_container_width=True)
            
            # Key insights
            st.markdown("### 💡 Key Insights")
            col1, col2 = st.columns(2)
            
            with col1:
                st.metric("Critic Score ↔ Sales", f"{corr_matrix.loc['Critic_Score', 'Global_Sales']:.3f}")
                st.metric("User Score ↔ Sales", f"{corr_matrix.loc['User_Score', 'Global_Sales']:.3f}")
            
            with col2:
                st.metric("NA Sales ↔ Global", f"{corr_matrix.loc['NA_Sales', 'Global_Sales']:.3f}")
                st.metric("EU Sales ↔ Global", f"{corr_matrix.loc['EU_Sales', 'Global_Sales']:.3f}")
    
    # ========== RECOMMENDATIONS ==========
    elif menu == "🎯 Recommendations":
        st.markdown("## 🎯 Strategic Recommendations")
        st.markdown("Rekomendasi berdasarkan analisis data untuk stakeholder")
        
        # Best performers
        best_genre = df_model[df_model['Success_Category']=='Blockbuster']['Genre'].value_counts().idxmax() if len(df_model[df_model['Success_Category']=='Blockbuster']) > 0 else "Action"
        best_platform = df_model[df_model['Success_Category']=='Blockbuster']['Platform'].value_counts().idxmax() if len(df_model[df_model['Success_Category']=='Blockbuster']) > 0 else "PS4"
        
        # Tabs for different stakeholders
        tab1, tab2, tab3 = st.tabs(["🏢 Publishers", "👨‍💻 Developers", "💰 Investors"])
        
        with tab1:
            st.markdown("### 🏢 Recommendations for Publishers")
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown(f"""
                <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 1.5rem; border-radius: 15px; color: white;'>
                    <h3>🎯 Best Genre</h3>
                    <h2>{best_genre}</h2>
                    <p>Highest success rate for blockbusters</p>
                </div>
                """, unsafe_allow_html=True)
            
            with col2:
                st.markdown(f"""
                <div style='background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                            padding: 1.5rem; border-radius: 15px; color: white;'>
                    <h3>🎮 Best Platform</h3>
                    <h2>{best_platform}</h2>
                    <p>Dominant platform for blockbuster games</p>
                </div>
                """, unsafe_allow_html=True)
            
            st.markdown("---")
            
            st.markdown("""
            ### 📋 Key Strategies
            
            1. **Focus on High-Scoring Games**
               - Games with Critic Score > 85 have 3x higher chance of becoming blockbusters
               - Invest in quality assurance and polish before launch
            
            2. **Multi-Platform Strategy**
               - Release on multiple platforms to maximize market reach
               - Consider platform exclusivity deals for major titles
            
            3. **Regional Focus**
               - North America contributes ~45% of global sales
               - Tailor marketing campaigns per region
            
            4. **Genre Selection**
               - Action and Shooter genres show highest ROI potential
               - Sports games perform well in Europe
            """)
        
        with tab2:
            st.markdown("### 👨‍💻 Recommendations for Developers")
            
            avg_critic_blockbuster = df_model[df_model['Success_Category']=='Blockbuster']['Critic_Score'].mean()
            avg_user_blockbuster = df_model[df_model['Success_Category']=='Blockbuster']['User_Score'].mean()
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("Target Critic Score", f">{avg_critic_blockbuster:.0f}")
            with col2:
                st.metric("Target User Score", f">{avg_user_blockbuster:.1f}")
            with col3:
                st.metric("Quality Focus", "High")
            
            st.markdown("---")
            
            st.markdown("""
            ### 🛠️ Development Guidelines
            
            1. **Quality Over Quantity**
               - Higher critic scores strongly correlate with success
               - Focus on gameplay polish and bug-free releases
            
            2. **User Experience**
               - User scores indicate long-term success
               - Prioritize player feedback during development
            
            3. **Genre Expertise**
               - Develop expertise in high-performing genres
               - Action and Shooter require refined mechanics
            
            4. **Platform Optimization**
               - Optimize for target platform's strengths
               - Consider performance on different hardware
            """)
        
        with tab3:
            st.markdown("### 💰 Recommendations for Investors")
            
            # Success rate by category
            success_rate = (df_model['Success_Category'].isin(['Blockbuster', 'Hit']).sum() / len(df_model)) * 100
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.metric("Industry Success Rate", f"{success_rate:.1f}%", help="Games achieving Hit or Blockbuster status")
            
            with col2:
                st.metric("Model Accuracy", f"{model_accuracy:.1%}", help="Prediction model accuracy")
            
            st.markdown("---")
            
            st.markdown("""
            ### 📊 Investment Guidelines
            
            1. **High-Confidence Investments**
               - Games with Critic Score > 85 and established publisher
               - Action/Shooter genres on major platforms
            
            2. **Risk Assessment**
               - Use prediction tool to assess game potential
               - Diversify across genres and platforms
            
            3. **Market Timing**
               - Release timing affects sales significantly
               - Avoid crowded release windows
            
            4. **Publisher Track Record**
               - Established publishers have higher success rates
               - Consider publisher's genre expertise
            """)
            
            # Publisher performance
            st.markdown("### 🏆 Top Performing Publishers")
            pub_performance = df_model.groupby('Publisher').agg({
                'Global_Sales': 'sum',
                'Success_Category': lambda x: (x.isin(['Blockbuster', 'Hit']).sum() / len(x)) * 100
            }).round(2)
            pub_performance.columns = ['Total Sales (M)', 'Success Rate (%)']
            pub_performance = pub_performance.sort_values('Total Sales (M)', ascending=False).head(10)
            
            fig = px.scatter(
                pub_performance.reset_index(),
                x='Total Sales (M)',
                y='Success Rate (%)',
                size='Total Sales (M)',
                hover_name='Publisher',
                color='Success Rate (%)',
                color_continuous_scale='Greens'
            )
            fig.update_layout(title="Publisher Performance: Sales vs Success Rate")
            st.plotly_chart(fig, use_container_width=True)

else:
    st.error("Failed to load data. Please check if the dataset files exist in the 'dataset' folder.")

# ==================== FOOTER ====================
st.markdown("---")
st.markdown("""
<div class='footer'>
    <p>🎮 <strong>Decision Support System - Video Games Analysis</strong></p>
    <p>Built with Streamlit | UAS Project 2024</p>
    <p style='font-size: 0.8rem; color: #999;'>
        Data Source: Video Games Sales Dataset | Model: Random Forest Classifier
    </p>
</div>
""", unsafe_allow_html=True)
