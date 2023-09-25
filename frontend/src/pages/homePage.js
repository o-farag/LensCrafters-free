import * as React from 'react';
import { MantineProvider, createTheme} from '@mantine/core';
import { GLTFViewer } from '../components/gltfViewer';


const theme = createTheme({
    /** Your theme override here */
  });

export function HomePage() {

    const [data, setData] = React.useState({
        name: ""
      });

      React.useEffect(() => {
        // Using fetch to fetch the api from
        // flask server it will be redirected to proxy
        fetch("/data").then((res) =>
          res.json().then((data) => {
            // Setting a data from api
            setData({
              name: data.Name
            });
          })
        );
      }, []);

    const renderHomePage = () => {
        return <GLTFViewer style={{ height: '50%' }}/>
    }

    return (
            <MantineProvider theme={theme}>
                <p>{data.name}</p>
                {renderHomePage()}
            </MantineProvider>
    );
}