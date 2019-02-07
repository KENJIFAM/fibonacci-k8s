import * as React from 'react';
import axios from 'axios';

interface Values {
  [key: string]: string;
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
      entries.push(
        <div key={key}>
          For index {key} I calculated {values[key]}
        </div>
      );
    }
    return entries;
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your index:</label>
        <input
          value={index}
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

export default Fib;
