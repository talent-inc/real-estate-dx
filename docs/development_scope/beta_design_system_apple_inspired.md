# Real Estate DX Design System
### Precision. Simplicity. Humanity.

---

## Design Philosophy

### One Thing Well
Each screen does one thing, exceptionally well. No distractions. No compromises.

### Depth Through Simplicity
Complexity is hidden, not eliminated. Progressive disclosure reveals power when needed.

### Emotional Precision
Every interaction should feel inevitable, not designed.

---

## Color

### The Palette

```css
:root {
  /* Primary */
  --ink: #1d1d1f;              /* 文字・UIの基本色 */
  --ink-secondary: #6e6e73;    /* 補助テキスト */
  --ink-tertiary: #c7c7cc;     /* 非アクティブ */
  
  /* Surfaces */
  --surface: #ffffff;          /* 純白の背景 */
  --surface-elevated: #f5f5f7; /* わずかな浮遊感 */
  --surface-secondary: #fafafa;/* 繊細な区別 */
  
  /* Interactive */
  --tint: #007AFF;            /* 決定的な青 */
  --tint-hover: #0051D5;      /* 深まる確信 */
  
  /* Semantic */
  --positive: #34C759;        /* 成功・進行 */
  --critical: #FF3B30;        /* 警告・停止 */
  
  /* Invisible */
  --shadow: rgba(0,0,0,0.08); /* 存在を主張しない影 */
  --border: rgba(0,0,0,0.08); /* 消えゆく境界線 */
}
```

### Usage Principles
- 色は機能。装飾ではない
- グレーの階調で95%を表現
- 青は「できること」を示す唯一の色

---

## Typography

### The System

```css
:root {
  --font: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 
          'Hiragino Sans', sans-serif;
  
  /* Sizes - Musical Scale */
  --text-xs: 11px;     /* Caption */
  --text-sm: 13px;     /* Secondary */
  --text-base: 15px;   /* Body */
  --text-lg: 17px;     /* Emphasis */
  --text-xl: 22px;     /* Title */
  --text-xxl: 28px;    /* Hero */
  
  /* Weight - Only What Matters */
  --regular: 400;
  --medium: 500;
  --semibold: 600;
  
  /* Leading - Breathe */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;
}
```

### Hierarchy Without Shouting
- Size differences are subtle (1.3x scale)
- Weight creates emphasis, not size
- Space defines importance

---

## Space & Layout

### The Grid of Calm

```css
:root {
  /* Base Unit - The Atom */
  --unit: 4px;
  
  /* Space Scale - Fibonacci-inspired */
  --space-xs: 4px;    /* 1 unit */
  --space-sm: 8px;    /* 2 units */
  --space-md: 16px;   /* 4 units */
  --space-lg: 24px;   /* 6 units */
  --space-xl: 40px;   /* 10 units */
  --space-xxl: 64px;  /* 16 units */
}
```

### Layout Philosophy
```css
.container {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.card {
  background: var(--surface);
  border-radius: 12px; /* Friendly, not sharp */
  padding: var(--space-lg);
  /* No border. No shadow. Until needed. */
}
```

---

## Components

### Button - The Moment of Decision

```tsx
// Only Two Types Exist
type ButtonVariant = 'primary' | 'secondary';

// The Design
const Button = styled.button<{variant: ButtonVariant}>`
  /* Foundation */
  height: 44px;
  padding: 0 22px;
  border-radius: 22px;
  font-size: var(--text-base);
  font-weight: var(--medium);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Primary - The Call to Action */
  ${props => props.variant === 'primary' && css`
    background: var(--tint);
    color: white;
    border: none;
    
    &:hover {
      background: var(--tint-hover);
      transform: scale(1.02);
    }
    
    &:active {
      transform: scale(0.98);
    }
  `}
  
  /* Secondary - The Alternative */
  ${props => props.variant === 'secondary' && css`
    background: transparent;
    color: var(--tint);
    border: 1.5px solid var(--border);
    
    &:hover {
      background: var(--surface-elevated);
    }
  `}
`;
```

### Input - Thought Made Form

```tsx
const Input = styled.input`
  /* The Canvas for Thought */
  width: 100%;
  height: 44px;
  padding: 0 16px;
  
  /* Barely There */
  background: var(--surface-elevated);
  border: 1px solid transparent;
  border-radius: 10px;
  
  /* Typography */
  font-size: var(--text-base);
  color: var(--ink);
  
  /* States */
  transition: all 0.2s ease;
  
  &::placeholder {
    color: var(--ink-tertiary);
  }
  
  &:hover {
    background: var(--surface-secondary);
  }
  
  &:focus {
    outline: none;
    background: var(--surface);
    border-color: var(--tint);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
`;
```

### Card - Information, Refined

```tsx
const PropertyCard = styled.article`
  /* The Stage */
  background: var(--surface);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  /* Subtle Depth */
  box-shadow: 0 1px 2px var(--shadow);
  
  /* Interaction */
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow);
  }
  
  /* Content Structure */
  .image {
    aspect-ratio: 16/9;
    object-fit: cover;
  }
  
  .content {
    padding: var(--space-lg);
  }
  
  .title {
    font-size: var(--text-lg);
    font-weight: var(--semibold);
    color: var(--ink);
    margin-bottom: var(--space-xs);
  }
  
  .price {
    font-size: var(--text-xl);
    font-weight: var(--medium);
    color: var(--ink);
    margin-bottom: var(--space-sm);
  }
  
  .details {
    font-size: var(--text-sm);
    color: var(--ink-secondary);
    line-height: var(--leading-relaxed);
  }
`;
```

---

## Interaction Design

### Motion Principles

```css
:root {
  /* The Sacred Curves */
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);
  
  /* The Sacred Durations */
  --duration-instant: 0.1s;
  --duration-fast: 0.2s;
  --duration-normal: 0.3s;
  --duration-slow: 0.5s;
}
```

### States - Clarity Without Words

```css
/* Loading - The Pulse of Progress */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

.skeleton {
  animation: pulse 1.5s var(--ease-in-out) infinite;
  background: var(--surface-elevated);
  border-radius: 6px;
}

/* Success - Brief Celebration */
@keyframes success {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* Error - Gentle Notification */
.error-shake {
  animation: shake 0.5s var(--ease-out);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
```

---

## The Details

### Icons - Meaning at a Glance
- Line weight: 1.5px
- Size: 20x20px (standard), 24x24px (emphasis)
- Style: Rounded, friendly, precise

### Corners - Approachable Precision
- Small elements: 6px
- Medium elements: 10px
- Large elements: 12px
- Never sharp, never too round

### Shadows - Depth Without Weight
```css
/* Elevation Levels */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.08);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.12);

/* Usage */
.floating { box-shadow: var(--shadow-md); }
.grounded { box-shadow: var(--shadow-sm); }
```

---

## Responsive Behavior

### Three Perfect Experiences

```css
/* iPhone - Personal */
@media (max-width: 428px) {
  :root {
    --text-base: 17px; /* Larger for thumbs */
  }
  
  .container {
    padding: 0 var(--space-md);
  }
  
  /* Stack everything */
  .grid { 
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
}

/* iPad - Focused */
@media (min-width: 429px) and (max-width: 1024px) {
  /* Two-column layouts */
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-lg);
  }
}

/* Mac - Powerful */
@media (min-width: 1025px) {
  /* Full experience */
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-xl);
  }
}
```

---

## What We Don't Do

### No Decoration
- No gradients without purpose
- No shadows for "depth"
- No borders for "definition"
- No animations for "delight"

### No Confusion
- One primary action per screen
- One way to accomplish each task
- One voice, everywhere

### No Waste
- Every pixel has purpose
- Every interaction has meaning
- Every word is necessary

---

## The Result

A system that feels like it was always meant to be. Where finding a property feels as natural as having a conversation. Where complexity becomes simplicity. Where technology serves humanity.

This is design at its purest. Not trying to impress, but to disappear. Not trying to be noticed, but to be useful. Not trying to be beautiful, but being beautiful because it works.

**"Simplicity is the ultimate sophistication."**  
*— Leonardo da Vinci*

In the hands of real estate professionals, this system becomes invisible. They don't use it; they think with it. And that is the highest achievement of design.