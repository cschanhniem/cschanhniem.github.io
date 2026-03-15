# NhapLuu (Nhập Lưu) - Stream Entry Path

https://cschanhniem.github.io/

> A modern web application guiding practitioners toward Stream Entry (Sotāpanna) in the 21st century

## Overview

**NhapLuu** (Vietnamese: Nhập Lưu, Pāli: Sotāpanna) is a comprehensive digital platform designed to support Buddhist practitioners on their journey toward the first stage of enlightenment - Stream Entry. In an age of digital distraction and information overload, this application provides structured guidance, tracking, and community support for serious Dhamma practice.

### What is Stream Entry (Sotāpanna)?

Stream Entry is the first of four stages of enlightenment in Theravada Buddhism, characterized by:
- Breaking the first three fetters (saṃyojana):
  1. Self-identity view (sakkāya-diṭṭhi)
  2. Doubt (vicikicchā)
  3. Attachment to rites and rituals (sīlabbata-parāmāsa)
- Unwavering confidence in the Triple Gem (Buddha, Dhamma, Sangha)
- Guaranteed enlightenment within seven lifetimes

## Core Philosophy

The path to Stream Entry in the 21st century requires:

1. **Noble Friends** (Kalyāṇamittā) - Spiritual community and guidance
2. **Listening to True Dhamma** (Saddhamma-savana) - Access to authentic teachings
3. **Wise Attention** (Yoniso-manasikāra) - Proper mental cultivation
4. **Practice in Accordance with Dhamma** (Dhammānudhamma-paṭipatti) - Consistent application

This application modernizes these timeless principles for contemporary practitioners.

## Features

### Practice Tracking
- Daily meditation session logging
- Precept (Sīla) observance tracking
- Uposatha day reminders and 8 precepts
- Progress visualization and insights

### Dhamma Library
- Curated Sutta translations (Pāli + Vietnamese/English)
- Daily Dhamma talks and readings
- Audio dharma for on-the-go listening
- Searchable teaching database

### Structured Programs
- 90-Day Stream Entry Intensive
- Weekly practice schedules
- Retreat preparation guides
- Vipassanā retreat finder

### Community Features
- Kalyāṇamitta 4.0: Online and offline Dhamma friends
- Discussion forums and Q&A
- Progress sharing and encouragement
- Teacher directory and guidance

### Meditation Timer
- Anapanasati (breath meditation) guidance
- Customizable session lengths
- Walking meditation intervals
- Mindfulness bells

### Wisdom Development Tools
- Three Characteristics (Anicca, Dukkha, Anattā) contemplation guides
- Four Foundations of Mindfulness (Satipaṭṭhāna) framework
- Daily reflection prompts
- Insight journal

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (customized with Buddhist design system)
- **State Management**: React Context + Hooks
- **Routing**: React Router
- **Data Persistence**: LocalStorage / IndexedDB
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm, pnpm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nhapluu-app.git
cd nhapluu-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
nhapluu-app/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── practice/        # Practice tracking components
│   │   ├── dhamma/          # Dhamma library components
│   │   └── community/       # Community features
│   ├── lib/
│   │   ├── utils.ts         # Utility functions
│   │   └── dhamma/          # Dhamma-specific logic
│   ├── pages/               # Page components
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── data/                # Static data (suttas, teachings)
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles + design tokens
├── public/                  # Static assets
├── design-system.md         # Design system documentation
├── plan.md                  # Development roadmap
└── README.md               # This file
```

## Design System

NhapLuu features a custom design system inspired by Buddhist aesthetics and principles. Key elements include:

- **Colors**: Saffron, Lotus Pink, Bodhi Blue, Dharma Green, Meditation Purple
- **Typography**: Clean, readable fonts with an 8-point scale (Eightfold Path)
- **Spacing**: Based on multiples of 8px
- **Principles**: Minimalism, clarity, mindfulness, accessibility

See [design-system.md](design-system.md) for complete documentation.

## Development Roadmap

See [plan.md](plan.md) for the detailed development plan and feature roadmap.

## The 90-Day Stream Entry Path

Our flagship program is a structured 90-day intensive designed to create optimal conditions for Stream Entry:

### Week 1-2: Foundation
- Establish 5 precepts
- 10 minutes daily meditation
- One sutta per evening

### Week 3-6: Deepening
- 5 precepts + daily practice
- 2 × 25 minutes meditation
- Walking meditation integration

### Week 7-10: Intensification
- Weekly "mini retreat" day (8 hours noble silence)
- Phone-free practice
- Satipaṭṭhāna focus

### Week 11-12: Breakthrough
- 7-10 day Vipassanā retreat
- Intensive practice under teacher guidance
- Integration and verification

## Core Practices

### 1. Precepts (Sīla)
The foundation of all progress:
- 5 precepts for daily life
- 8 precepts on Uposatha days
- Precept tracking and reflection

### 2. Concentration (Samādhi)
Building mental strength:
- Minimum 30-40 minutes, 2× daily
- Anapanasati (mindfulness of breathing) primary method
- Daily life mindfulness practices

### 3. Wisdom (Paññā)
Direct insight into reality:
- Three Characteristics contemplation
- Four Foundations of Mindfulness
- Experiential understanding, not conceptual

## Contributing

We welcome contributions from the Dhamma community! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Verification and Safety

This application provides guidance based on traditional Buddhist teachings. However:

- Always verify insights with qualified teachers
- Retreat practice should be done under proper guidance
- Mental health concerns should be addressed with professionals
- The four qualities of Stream Entry should be verified by experienced practitioners

## Resources

### Recommended Teachers and Traditions
- **Mahasi Sayadaw** tradition (Burma)
- **Pa-Auk Sayadaw** (samatha-vipassanā)
- **Thai Forest** tradition (Ajahn Chah, Ajahn Brahm)
- **Goenka** 10-day courses
- **Bhikkhu Bodhi** translations and teachings

### Key Suttas
- MN 118: Anapanasati Sutta
- DN 22: Mahāsatipaṭṭhāna Sutta
- SN 55: Sotāpatti Saṃyutta
- AN 4.62: At Kosambi

## License

MIT License - See [LICENSE](LICENSE) for details

## Acknowledgments

- All credit to the Buddha for the teachings
- Thanks to the Sangha for preserving the Dhamma
- Gratitude to all teachers who have guided practitioners
- Appreciation for open-source community and tools

## Contact

- Website: [nhapluu.com](https://nhapluu.com)
- Email: contact@nhapluu.com
- Discord: [Join our Sangha](https://discord.gg/nhapluu)

---

**Dhamma Disclaimer**: This application is a tool to support practice. True liberation comes from direct experience and proper practice, not from technology. May all beings find the path to awakening.

*Sabbe sattā sukhi hontu* - May all beings be happy
