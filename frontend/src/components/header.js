import { Image, Text, Flex } from '@mantine/core';
import glasses_icon from '../resources/glasses_icon.png'
import { useNavigate } from 'react-router-dom';

export function Header(props) {
    const navigate = useNavigate();

    return (
        <Flex onClick={() => navigate('/')}
            align='center' justify='flex-start' bg='#FBF6E9' h='3em' w='100%' gap='sm' px='1em'
            style={{ cursor: 'pointer' }}>
            <Image h='2.5em' px='1em' src={glasses_icon} />
            <Text size='sm' fs='italic' padding='1em'>OptiDesign</Text>
        </Flex>
    );
}