# Credli.ai Ask Engine Optimization

Minimal digital reputation analyzer MVP that generates trust scores based on public mentions.

## How to Run

1. Install dependencies:
   ```bash
   cd trustsource
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser to: http://localhost:5050

## Usage

1. Enter a name/entity (e.g., "Elon Musk")
2. Enter a keyword (e.g., "innovation")
3. Click "Analyze Trust Score"

The system will search Wikipedia and DuckDuckGo for mentions and calculate a trust score (0-100) based on:
- Breadth of mentions (up to 50 points)
- Authority of sources (30 points for high-authority sources)
- Quality bonus (10 points for Wikipedia presence)
- Keyword matches (5 points each)

## API

- `POST /api/analyze` - Analyze trust score
  - Body: `{ "name": "string", "keyword": "string" }`
  - Returns: `{ "name", "keyword", "trustScore", "mentions": [] }`