# Labs Assistant (TALONG)

**Task Automation for Laboratory Orders and Needs Generator**

Labs Assistant is a specialized medical tool designed to streamline the generation of laboratory request forms. It assists healthcare professionals in accurately documenting and organizing laboratory orders while providing essential reminders for specimen collection and patient preparation.

## Key Features

- **Intelligent Order Entry:** Easily input laboratory tests with automatic alias matching and specimen-specific validation.
- **Specimen Handling Reminders:** Automated reminders for special collection requirements (e.g., fasting, tube types, collection times).
- **Automated Form Generation:** Generates organized laboratory request lists categorized by form type and specimen.
- **Fasting & Preparation Guidance:** Provides clear instructions for patient preparation, including specific fasting intervals for FBS, Lipid Profile, and specialty tests.
- **Electrophoresis Support:** Includes specific requirements and scheduling for SPEP, UPEP, and Hemoglobin Electrophoresis.

## Core Capabilities

- **specimen-Specific Logic:** Handles complex specimen types such as Pleural Fluid, Ascitic Fluid, CSF, and ETA with appropriate prefixes and handling rules.
- **Departmental Routing:** Automatically identifies and labels tests destined for specialized labs like MRL or Nuclear Medicine.
- **Reference Management:** Built-in lookup table for common medical tests and their corresponding requirements.

## Tech Stack

- **Frontend:** React with TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Motion
- **Build Tool:** Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

### Production Build

Create a production-ready build:
```bash
npm run build
```

## Usage

Simply enter the list of laboratory tests in the input field. The assistant will automatically parse your requests, categorize them, and provide necessary reminders for each test. You can then use the generated summary to finalize your laboratory orders.
