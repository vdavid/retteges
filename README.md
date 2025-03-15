# Retteges

A family implementation of a social deduction game, similar to "One Night Ultimate Werewolf". This
application guides players through different stages of the game with audio instructions.

## Features

- Character selection screen
- Game stage progression with audio guidance
- Background music
- Support for various character roles (Werewolf, Seer, Villager, etc.)
- Responsive design

## Getting Started

Needs Node.js 22+ and pnpm 10+.

### Installation

1. Clone the repo

```bash
git clone https://github.com/yourusername/retteges.git
cd retteges
```

2. Install dependencies:

```bash
pnpm install
```

### Development

1. Run the dev server:
    ```bash
    pnpm dev
    ```
2. Open [http://localhost:3000](http://localhost:3000) with a browser

### Testing

Run tests:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test:watch
```

### Linting

Check for linting issues:

```bash
pnpm lint
```

### Building for Production

Build the application for production:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Project Structure

- `pages/` - Next.js pages
- `modules/` - Game components and logic
- `public/` - Static assets (images, audio)
    - `public/audio/` - Game audio files
    - `public/images/` - Game images

## License

This project is licensed under the MIT License - see the LICENSE file for details.
