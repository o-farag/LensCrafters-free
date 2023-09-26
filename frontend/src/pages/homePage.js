import * as React from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { VisualizeOptionsPage } from './visualizeOptionsPage';

const theme = createTheme({
    primaryColor: 'muteBlue',
    colors: {
      'muteBlue': [
        '#ecf6ff',
        '#dee8f1',
        '#bfcedc',
        '#9cb3c8',
        '#7f9db6',
        '#6c8eac',
        '#6287a8',
        '#507493',
        '#446785',
        '#335a77'
      ],
      'beige': [
        "#fcf8ee",
        "#f6efdd",
        "#eeddb3",
        "#e5ca86",
        "#deb961",
        "#d9af4a",
        "#d7aa3c",
        "#be942f",
        "#a98427",
        "#93711b"
      ]
    }
});

export function HomePage() {

  const [data, setData] = React.useState({
    name: ''
  });

  React.useEffect(() => {
    // Using fetch to fetch the api from
    // flask server it will be redirected to proxy
    fetch('/data').then((res) =>
      res.json().then((data) => {
        // Setting a data from api
        setData({
          name: data.Name
        });
      })
    );
  }, []);

  const renderHomePage = () => {
    return (
      <VisualizeOptionsPage />
    )
  }

  return (
    <MantineProvider theme={theme}>
      <p>{data.name}</p>
      {renderHomePage()}
    </MantineProvider>
  );
}