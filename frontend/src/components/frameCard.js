import * as React from 'react';
import { Text, Card, Image } from '@mantine/core';

export function FrameCard(props) {
    const [borderColor, setBorderColor] = React.useState('var(--mantine-color-gray-3)');

    React.useEffect(() => {
        if (props.frame.id !== props.frameID) {
            setBorderColor('var(--mantine-color-gray-3)')
        }
      }, [props.frame.id, props.frameID])

    function handleSelectFrame() {
        props.setFrameID(props.frame.id)
        setBorderColor('#4D708E')
        props.setValid(true)
    }

    return (
        <Card
            shadow='sm'
            padding='xl'
            m='0.5em'
            withBorder
            style={{ border: '1.5px solid ' + borderColor }}
            onClick={handleSelectFrame}
        >
            <Card.Section>
                <Image
                    p='1em'
                    src={props.frame.src}
                    style={{ width: '20em', height: '13em', objectFit: 'cover' }}
                />
            </Card.Section>
            <Text fw={500} size='sm' mt='lg'>
                {props.frame.name}
            </Text>
            <Text mt='md' c='dimmed' size='sm'>
                Material: {props.frame.material}
            </Text>
        </Card>
    );
}