import { Container } from '@mui/material';
import * as React from 'react';
import { GLTFViewer } from '../components/gltfViewer';


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
        return <GLTFViewer />
    }

    return (
            <Container>
                <p>{data.name}</p>
                {renderHomePage()}
            </Container>
    );
}