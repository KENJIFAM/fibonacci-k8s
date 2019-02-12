import * as React from 'react';
import axios from 'axios';
import { Button, Modal, Loader, Segment, Form, Table, Icon, Dimmer, Image } from 'semantic-ui-react';

interface Values {
  [key: string]: string;
}

interface Data {
  value: string;
  processTime: number;
  len: number;
}

interface ShowValueProps {
  value: string;
}

const Fib = () => {
  const [seenIndexes, setSeenIndexes] = React.useState<[]>([]);
  const [values, setValues] = React.useState<Values>({});
  const [index, setIndex] = React.useState<string>('');
  const [lastIndex, setLastIndex] = React.useState<string>('');

  const fetchValues = async () => {
    const values = await axios.get('/api/values/current');
    if(typeof values.data === 'object') setValues(values.data);
  };

  const fetchIndexes = async () => {
    const seenIndexes = await axios.get('api/values/all');
    setSeenIndexes(seenIndexes.data);
  };

  React.useEffect(() => {
    fetchValues();
    fetchIndexes();
  }, [lastIndex]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (index && index !== lastIndex) {
      await axios.post('api/values', { index });
      if (values[index]) {
        setValues({ ...values, [index]: 'Nothing yet!' });
      }
      setLastIndex(index);
      setIndex('');
    }
  };

  const result = () => {
    if (!values[lastIndex]) {
      return (
        <Segment>
          <Dimmer active inverted>
            <Loader>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
        </Segment>
      );
    }
    if (values[lastIndex] === 'Nothing yet!') {
      setTimeout(() => fetchValues(), 1000);
      return (
        <Segment>
          <Dimmer active inverted>
            <Loader>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
        </Segment>
      );
    }
    const data: Data = JSON.parse(values[lastIndex]);
    return (
      <Segment>
        <p><strong>Value:</strong> <ShowValue value={data.value} /></p>
        <p><strong>Number of digits:</strong> {data.len} digits</p>
        <p><strong>Processing time:</strong> {data.processTime} ms</p>
      </Segment>
    );
  };

  const seenIndexesList = () => {
    return seenIndexes.map(({ number }) => number).join(', ');
  };

  const valuesList = () => {
    const entries = [];
    for (let key in values) {
      if (!values[key] || values[key] === 'Nothing yet!') {
        entries.push(
          <Table.Row key={key}>
            <Table.Cell>{key}</Table.Cell>
            <Table.Cell><Icon loading name='spinner' /></Table.Cell>
            <Table.Cell><Icon loading name='spinner' /></Table.Cell>
            <Table.Cell><Icon loading name='spinner' /></Table.Cell>
          </Table.Row>
        );
      } else {
        const data: Data = JSON.parse(values[key]);
        entries.push(
          <Table.Row key={key}>
            <Table.Cell>{key}</Table.Cell>
            <Table.Cell>
              <ShowValue value={data.value} />
            </Table.Cell>
            <Table.Cell>{data.len}</Table.Cell>
            <Table.Cell>{data.processTime} ms</Table.Cell>
          </Table.Row>
        );
      }
    }
    return entries;
  };

  return (
    <div className='ui container'>
      <Segment raised>
        <h3>Enter your index</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group widths='equal'>
            <Form.Input
              type='number'
              value={index}
              min='0'
              max='1000000'
              onChange={event => setIndex(event.target.value)}
            />
            <Button secondary>Submit</Button>
          </Form.Group>
        </Form>
        {lastIndex && (
          <div>
            <h3>Result</h3>
            {result()}
          </div>
        )}
      </Segment>

      <Segment raised>
        <h3>Indexes I have seen</h3>
        {seenIndexesList()}
      </Segment>
      
      <Segment>
        <h3>Calculated Values</h3>
        <Segment basic className='calculated'>
          <Table unstackable celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Index</Table.HeaderCell>
                <Table.HeaderCell>value</Table.HeaderCell>
                <Table.HeaderCell>Digits</Table.HeaderCell>
                <Table.HeaderCell>Time</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {valuesList()}
            </Table.Body>
          </Table>
        </Segment>
      </Segment>
    </div>
  );
};

const ShowValue = ({ value }: ShowValueProps) => {
  if (value.length <= 20) {
    return <span>{value}</span>;
  }
  const shortValue = `...${value.slice(-20)}`;
  return (
    <Modal trigger={<span>{shortValue} <Icon name='external alternate' /></span>}>
      <Modal.Content scrolling >
        <Modal.Description>
          {value}
        </Modal.Description>
      </Modal.Content>
    </Modal>
  )
};

export default Fib;
