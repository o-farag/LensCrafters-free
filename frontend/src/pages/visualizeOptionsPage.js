import * as React from 'react';
import { Text, Flex, ActionIcon, Title, Paper, Button, Popover, Table, Divider } from '@mantine/core';
import { Header } from '../components/header'
import { IconChevronLeft, IconListCheck } from '@tabler/icons-react';
import { VisualizeCard } from '../components/visualizeCard';
import { StepperBar } from '../components/stepperBar';
import '@google/model-viewer/dist/model-viewer';
import { AppStateContext } from './AppStateContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { respondToBrowserState } from './homePage';

export function VisualizeOptionsPage(props) {
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
      setActive(respondToBrowserState(location));
    });

    const {
        prescription,
        material,
        frameID,
        active, setActive,
        frames
      } = React.useContext(AppStateContext);

    const frameName = frames.find(frame => frame.id === frameID).name;
    const weight = {
        lens: 70,
        frame: 210,
        combined: 280,
    }
    const {
        SPH_OD, SPH_OS, CYL_OD, CYL_OS, AXIS_OD, AXIS_OS, PD
    } = prescription;

    // Define the table rows
    const rows = [
        <Table.Tr key="OD">
            <Table.Td>OD</Table.Td>
            <Table.Td>{SPH_OD}</Table.Td>
            <Table.Td>{CYL_OD}</Table.Td>
            <Table.Td>{AXIS_OD}</Table.Td>
            <Table.Td rowSpan={2}>{PD}</Table.Td>
        </Table.Tr>,
        <Table.Tr key="OS">
            <Table.Td>OS</Table.Td>
            <Table.Td>{SPH_OS}</Table.Td>
            <Table.Td>{CYL_OS}</Table.Td>
            <Table.Td>{AXIS_OS}</Table.Td>
            {/* No PD cell here because it is merged with the one above */}
        </Table.Tr>
    ];

    return (
        <>
            <style>{`
                .mantine-Modal-header {
                background-color: #a7b9cd !important;  // using !important to ensure the style is applied
                }
            `}</style>
            <Header></Header>
            <Flex direction='column' pt='2.5em' pl='3em' gap='1em' >
                <Flex align='center' gap='1em' mr='6em'>
                    <ActionIcon
                        variant='transparent' color='rgba(0, 0, 0, 1)' size='xl' aria-label='Settings'
                        onClick={() => {
                            setActive(1);
                            navigate('/select-lens-frame');
                        }}>
                        <IconChevronLeft style={{ width: '80%', height: '80%' }} stroke={1.5} />
                    </ActionIcon>
                    <StepperBar active={active}></StepperBar>
                    <Popover width='25em' position='bottom' withArrow shadow='md' offset={{ mainAxis: 15, crossAxis: -30 }}>
                        <Popover.Target>
                            <Button leftSection={<IconListCheck size={14} />} ml='auto'>View Selection</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text fs='italic'>Prescription</Text>
                            <Divider my=".4em" />
                            <Table withRowBorders={false}>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th></Table.Th> {/* Empty header for the OD/OS column */}
                                        <Table.Th>SPH</Table.Th>
                                        <Table.Th>CYL</Table.Th>
                                        <Table.Th>Axis</Table.Th>
                                        <Table.Th>PD</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{rows}</Table.Tbody>
                            </Table>
                            <Text fs='italic' mt='2em'>Lens Material</Text>
                            <Divider my=".4em" />
                            <Text mt='1em' size='0.8em'>{material}</Text>
                            <Text fs='italic' mt='2em'>Frames</Text>
                            <Divider my=".4em" />
                            <Text mt='1em' size='0.8em'>{frameName}</Text>
                        </Popover.Dropdown>
                    </Popover>
                </Flex>
                <Title order={2} pl='2.5em' mt='1em' >Visualize your glasses</Title>
                <Flex gap='3em' mx='4em' mt='1em'>
                    <VisualizeCard title='3D Interactive Viewer'
                        description='View the 3D model of the lenses and frames you’ve selected in detail by panning and zooming in the viewer window'
                        material={material}
                        frameName={frameName}></VisualizeCard>
                    <VisualizeCard title='Virtual Try-on' description='Try on the lenses and frames you’ve selected virtually'
                        material={material}></VisualizeCard>
                    <Paper bg='#EAEFF3' radius='xl' w='10%' h='35em' align='center'>
                        <Text fw={700} size='1.2em' pt='4em'>
                            WEIGHT
                        </Text>
                        <Text fw={600} size='md' mt='5em'> Lens Only</Text>
                        <Text fw={400} size='md' mt='.5em'> {weight.lens}g</Text>
                        <Text fw={600} size='md' mt='3em'> Frames Only</Text>
                        <Text fw={400} size='md' mt='.5em'> {weight.frame}g</Text>
                        <Text fw={600} size='md' mt='3em'> Combined </Text>
                        <Text fw={400} size='md' mt='.5em'> {weight.combined}g</Text>
                    </Paper>
                </Flex>
            </Flex>
        </>
    );
}