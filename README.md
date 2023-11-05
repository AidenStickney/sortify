# Sortify
  Sortify is a web application that enhances your Spotify experience by allowing you to sort your playlists based on Spotify's song metrics. With an intuitive drag-and-drop interface, you can easily reorder your playlists to match your listening preferences.

## Features

  - **Sort Playlists**: Automatically sort your Spotify playlists using a variety of Spotify's song metrics such as tempo, energy, danceability, and more.
  - **Drag and Drop**: Manually reorder your playlists with a simple and intuitive drag-and-drop interface.
  - **Seamless Integration**: Connects directly with your Spotify account for a seamless sorting experience.
  - **Customizable Metrics**: Choose which metrics you want to use for sorting your playlists.

## Getting Started

To get started with Sortify, follow these steps:

  1. **Clone the repository**:
      ```sh
        git clone https://github.com/AidenStickney/sortify.git
      ```
  2. **Navigate to the project directory**:
      ```sh
        cd sortify
      ```
  3. **Install dependencies**:
      ```sh
        npm install
      ```
  4. **Set up your Spotify Developer Account**:
      - Create a Spotify Developer account if you don't have one.
      - Register your application to obtain the `Client ID` and `Client Secret`.
      - Add the redirect URI used in the Sortify application to your Spotify app settings.
  5. **Configure environment variables**:
      - Create a `.env` file in the project root.
      - Add your `Client ID` and `Client Secret` along with the redirect URI to the `.env` file.
      
  6. **Run the application**:
      ```sh
        npm start
      ```
    
## Usage

Once you have Sortify up and running, log in with your Spotify credentials. Select the playlist you want to sort, choose the desired metrics, and click the \"Sort\" button. You can also drag and drop songs within the playlist to manually reorder them.

## Note

I'm currently awaiting approval from Spotify for an increased quota, which is necessary to open the deployed site to the public.

## Contact

Try it out: [https://sortify-alpha.vercel.app/](https://sortify-alpha.vercel.app/)

Project Link: [https://github.com/AidenStickney/sortify](https://github.com/AidenStickney/sortify)
