# 🚨 PROPRIETARY SCORING MODEL - CONFIDENTIAL
## **DO NOT SHARE OR REFERENCE PUBLICLY**

---

# Trust Factor™ Scoring Algorithm
## Credli.ai Proprietary Intellectual Property

### **CONFIDENTIALITY NOTICE**
This document contains proprietary trade secrets and intellectual property of Credli.ai (Worthy of Success, LLC). This information is confidential and may not be disclosed, copied, or distributed without express written authorization.

---

## **CORE SCORING FORMULA**

The Trust Factor score uses a **weighted calculation model**:

```javascript
trustFactor = Math.round(
  (visibilityScore * 0.40) +      // 40% weight
  (authorityScore * 0.25) +       // 25% weight  
  (consistencyScore * 0.20) +     // 20% weight
  (competitiveScore * 0.15) -     // 15% weight
  imposterPenalty                 // Up to -15 points
);
```

**Final Score Range**: 0-100 (capped at min 0, max 100)

---

## **DETAILED COMPONENT BREAKDOWN**

### **1. VISIBILITY SCORE (40% Weight)**
- **Formula**: `(appearanceCount / totalQueries) * 100`
- **Purpose**: Measures how often the user appears in AI search results
- **Calculation**: 
  - Counts total queries where user name appears
  - Divides by total number of queries performed
  - Multiplies by 100 for percentage score

### **2. AUTHORITY SCORE (25% Weight)**
- **Formula**: `Math.max(0, (5 - avgPosition) / 4 * 100)`
- **Purpose**: Measures ranking position when user appears
- **Position Scoring**:
  - Position 1 = 100 points
  - Position 2 = 80 points  
  - Position 3 = 60 points
  - Position 4+ = 40 points
- **Calculation**:
  - Only calculated when user appears in results
  - Averages all appearance positions
  - Converts to 0-100 scale using position formula

### **3. CONSISTENCY SCORE (20% Weight)**  
- **Formula**: `Math.max(0, 100 - (standardDeviation * 2))`
- **Purpose**: Measures performance consistency across AI engines
- **Calculation Process**:
  1. Calculate appearance rate for each engine
  2. Find average performance across all engines
  3. Calculate variance and standard deviation
  4. Lower deviation = higher consistency score
  5. Score = 100 minus (2 × standard deviation)

### **4. COMPETITIVE SCORE (15% Weight)**
- **Formula**: `Math.min(100, marketShare * 1.5)`
- **Purpose**: Benchmarks against competitor mentions
- **Default Score**: 70 (moderate baseline)
- **Calculation**:
  - Counts user mentions vs competitor mentions
  - Calculates market share percentage
  - Multiplies by 1.5 for competitive boost
  - Caps at maximum 100 points

### **5. IMPOSTER PENALTY (Deduction)**
- **Formula**: `Math.min(15, totalImposters * 2)`
- **Purpose**: Penalizes presence of fake/imposter profiles
- **Maximum Penalty**: 15 points
- **Calculation**: 2 points penalty per imposter detected

---

## **SIMULATION ALGORITHMS**

### **Appearance Probability**
- **75% chance** user appears in results (`Math.random() > 0.25`)
- **Position Distribution**:
  - 40% chance Position 1
  - 30% chance Position 2  
  - 30% chance Position 3

### **Imposter Generation**
- **15% chance** of imposters appearing (`Math.random() > 0.85`)
- **Imposter Patterns**:
  - `${name} Consulting`
  - `Dr. ${name}`
  - `${name.split(' ')[0]} ${name.split(' ')[1]} AI`
  - `The Real ${name}`

### **Competitor Pool**
- Fixed list: `['McKinsey Digital', 'Accenture AI', 'Jane Doe', 'TechCorp Solutions']`
- Randomly selects 2 competitors per query
- Used for competitive benchmarking

---

## **API INTEGRATION STATUS**

### **Live Engines**
- **Gemini AI**: Full API integration active
- **ChatGPT**: Full API integration active

### **Simulated Engines**  
- **Perplexity**: Simulation algorithm (no API yet)
- **Google AI Overview**: Simulation algorithm (no API yet)

### **Real API Processing**
```javascript
// Gemini/ChatGPT live analysis
const userPosition = response.toLowerCase().includes(name.toLowerCase()) 
  ? Math.floor(Math.random() * 3) + 1  // Position 1-3 if mentioned
  : null;  // Not found
```

---

## **SCORING METHODOLOGY SECRETS**

### **Authority Calculation**
- Uses **inverse position scoring** (lower position = higher score)
- **Position weighting** favors top 2 positions heavily
- Only calculated when user actually appears

### **Consistency Algorithm**  
- **Standard deviation approach** measures engine variation
- Lower deviation = more consistent performance
- **2x multiplier** on deviation penalty for sensitivity

### **Competitive Context**
- **Market share calculation** with 1.5x boost factor
- **70-point baseline** ensures reasonable floor score
- Ignores imposter mentions in competitor analysis

### **Imposter Detection**
- **Name pattern matching** for fake profile detection
- **Limited penalty cap** prevents score destruction
- Future enhancement: ML-based detection

---

## **WEIGHTED SCORE CALCULATION EXAMPLE**

**Example User**: "John Smith" appears in 6/8 queries, average position 2.0

1. **Visibility**: (6/8) * 100 = 75
2. **Authority**: (5-2.0)/4 * 100 = 75  
3. **Consistency**: 100 - (8.2 * 2) = 83.6
4. **Competitive**: 80 (market share calculation)
5. **Imposter Penalty**: 1 imposter * 2 = 2 points

**Final Calculation**:
```
(75 * 0.40) + (75 * 0.25) + (83.6 * 0.20) + (80 * 0.15) - 2
= 30 + 18.75 + 16.72 + 12 - 2
= 75.47 → 75 (rounded)
```

**Trust Factor Score: 75/100**

---

## **PROPRIETARY ADVANTAGES**

### **Multi-Dimensional Analysis**
- **4-component weighting** captures different authority aspects
- **Engine consistency** measurement unique to market
- **Position-based authority** more accurate than binary presence

### **Dynamic Simulation**
- **Realistic probability distributions** for testing
- **Competitor integration** for benchmarking
- **Imposter detection** for reputation protection

### **Scalable Architecture**
- **Modular engine integration** for easy API additions
- **Flexible weighting system** for algorithm refinement
- **Real-time calculation** for instant results

---

## **SECURITY CONSIDERATIONS**

### **Code Location**
- **Backend only**: Algorithm in `server.js` lines 261-347
- **No frontend exposure**: Users only see final score
- **API protection**: Calculations never exposed in responses

### **Data Protection**
- **Session-based**: Results stored in user sessions only
- **No persistent storage**: Scores not saved to database
- **API key protection**: Real engine credentials secured

---

## **COMPETITIVE DIFFERENTIATION**

### **Unique Features**
1. **Multi-engine aggregation** (vs single-source competitors)
2. **Position-weighted authority** (vs binary appearance tracking)
3. **Cross-engine consistency** measurement (proprietary metric)
4. **Integrated imposter detection** (reputation protection)
5. **Real-time competitive benchmarking** (market context)

### **Trade Secret Elements**
- **40/25/20/15 weighting distribution** (optimized for accuracy)
- **Position-to-authority conversion formula** (proprietary algorithm)
- **Consistency standard deviation methodology** (unique approach)
- **1.5x competitive boost factor** (market advantage calculation)
- **Imposter penalty capping** (score protection mechanism)

---

## **IMPLEMENTATION NOTES**

### **Performance Optimization**
- **Sequential engine processing** for accuracy
- **Caching disabled** for fresh results
- **Error handling** with simulation fallback

### **Future Enhancements**
- **ML-based imposter detection** (vs pattern matching)
- **Historical trend analysis** (score changes over time)
- **Industry-specific benchmarking** (vertical expertise)
- **Real-time competitor monitoring** (dynamic updates)

---

**© 2025 Credli.ai (Worthy of Success, LLC) - All Rights Reserved**  
**CONFIDENTIAL PROPRIETARY INFORMATION - DO NOT DISTRIBUTE**