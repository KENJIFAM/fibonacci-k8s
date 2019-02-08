import * as React from 'react';
import axios from 'axios';
import { Button, Header, Icon, Image, Modal } from 'semantic-ui-react';

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

  const fetchValues = async () => {
    const values = await axios.get('/api/values/current');
    setValues(values.data);
  };

  const fetchIndexes = async () => {
    const seenIndexes = await axios.get('api/values/all');
    setSeenIndexes(seenIndexes.data);
  };

  React.useEffect(() => {
    fetchValues();
    fetchIndexes();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await axios.post('api/values', { index });
    setIndex('');
    fetchValues();
    fetchIndexes();
  };

  const seenIndexesList = () => {
    return seenIndexes.map(({ number }) => number).join(', ');
  };

  const valuesList = () => {
    const entries = [];
    for (let key in values) {
      if (values[key] === 'Nothing yet!') {
        entries.push(
          <div key={key}>
            Index {key}, value: {values[key]}
          </div>
        );
      } else {
        const data: Data = JSON.parse(values[key]);
        const value = data.value.length <= 30
          ? data.value
          : `...${data.value.slice(-30)}`;
        entries.push(
          <div key={key}>
            Index {key}, value: {value} ({data.len} digits, {data.processTime} ms)
            {data.value.length > 30 &&
              <ShowValue value={data.value} />
            }
          </div>
        );
      }
    }
    return entries;
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your index:</label>
        <input
          type='number'
          value={index}
          min='0'
          max='1000000'
          onChange={event => setIndex(event.target.value)}
        />
        <button>Submit</button>
      </form>

      <h3>Indexes I have seen:</h3>
      {seenIndexesList()}

      <h3>Calculated Values:</h3>
      {valuesList()}
    </div>
  );
};

const ShowValue = ({ value }: ShowValueProps) => (
  <Modal trigger={<Button>Show</Button>}>
    <Modal.Content scrolling >
      <Modal.Description>
        {value}
      </Modal.Description>
    </Modal.Content>
  </Modal>
);

export default Fib;
