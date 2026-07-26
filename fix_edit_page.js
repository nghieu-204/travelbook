const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/admin/tours/edit/[id]/page.tsx', 'utf-8');

// Add state for metadata and destination_id
const stateRegex = /const \[category, setCategory\] = useState\('Trong nước'\)/;
code = code.replace(stateRegex, `const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const data = await fetchApi('/metadata');
        setCategories(data.categories || []);
        setRegions(data.regions || []);
        setDestinations(data.destinations || []);
      } catch (err) {
        console.error('Lỗi tải metadata', err);
      }
    };
    fetchMeta();
  }, []);

  const [category, setCategory] = useState('Trong nước')`);

fs.writeFileSync('frontend/src/app/admin/tours/edit/[id]/page.tsx', code);
