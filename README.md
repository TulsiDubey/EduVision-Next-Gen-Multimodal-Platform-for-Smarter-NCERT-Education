# Educational Platform

An interactive educational platform for students to learn Physics, Chemistry, and Biology with visualizations and quizzes.

## Features

- User authentication (login/signup)
- Profile setup with class and subject selection
- Interactive subject modules
- 3D visualizations for better understanding
- Topic-wise quizzes
- Progress tracking

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase account (for authentication)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd educational-platform
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and enable Authentication:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Email/Password authentication
   - Get your Firebase configuration

4. Update Firebase configuration:
   - Open `src/contexts/AuthContext.js`
   - Replace the `firebaseConfig` object with your Firebase configuration

5. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
  ├── components/
  │   ├── auth/
  │   │   ├── Login.js
  │   │   └── Signup.js
  │   ├── Dashboard.js
  │   ├── ProfileSetup.js
  │   ├── Quiz.js
  │   └── Visualization.js
  ├── contexts/
  │   └── AuthContext.js
  ├── App.js
  └── index.js
```

## Visualization APIs

The platform integrates with various visualization tools:

### Chemistry
- MolView (https://molview.org/)
- ChemTube3D (https://www.chemtube3d.com/)
- VChem3D (https://vchem3d.univ-tlse3.fr/)

### Biology
- Visible Body (https://www.visiblebody.com/learn/biology)
- Smart Biology (https://www.smart-biology.com/)

### Physics
- PhET (https://phet.colorado.edu/)
- oPhysics (https://ophysics.com/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 