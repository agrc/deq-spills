import { useDarkMode } from 'usehooks-ts';

export default function EsriCss() {
  const paths = {
    light: '/assets/esri/themes/light/main.css',
    dark: '/assets/esri/themes/dark/main.css',
  };

  const { isDarkMode } = useDarkMode();

  console.log('isDarkMode', isDarkMode);

  return <link rel="stylesheet" href={isDarkMode ? paths.dark : paths.light} />;
}
