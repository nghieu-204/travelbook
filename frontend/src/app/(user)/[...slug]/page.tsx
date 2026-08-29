/* eslint-disable @typescript-eslint/no-explicit-any */
import TourDetailPage from '../tours/[id]/page'
import ToursPage from '../tours/page'
import CheckoutPage from '../tours/[id]/checkout/page'
import { fetchApi } from '@/lib/api'
import { generateSlug } from '@/lib/utils'

export default async function CatchAllPage(props: {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await props.params;
  const lastSegment = slug[slug.length - 1];

  // 1. Check if it's a checkout page
  if (slug.length >= 3 && slug[0] === 'tours' && slug[2] === 'checkout') {
    const id = slug[1];
    return <CheckoutPage params={Promise.resolve({ id })} />
  }

  // 1.5. Check if it's a tour details page (last segment ends with -{id} or is just {id})
  let id = null;
  const match = lastSegment.match(/-(\d+)$/);
  if (match) {
    id = match[1];
  } else if (slug[0] === 'tours' && slug.length === 2 && /^\d+$/.test(slug[1])) {
    id = slug[1];
  }

  if (id) {
    // Return TourDetailPage with extracted ID
    return <TourDetailPage params={Promise.resolve({ id })} />
  }

  // 2. Otherwise, it's a tour listing page (Category -> Region -> Province -> Destination)
  // We need to translate slugs back to actual names to pass to ToursPage searchParams
  let categoryName = '';
  let regionName = '';
  let provinceName = '';

  try {
    const filtersMeta = await fetchApi('/tours/filters-metadata', { cache: 'no-store' });
    
    // Slugs from URL
    const categorySlug = slug[0];
    const regionSlug = slug.length > 1 ? slug[1] : null;

    // Determine category
    if (categorySlug === generateSlug('Trong nước')) {
      categoryName = 'Trong nước';
    } else if (categorySlug === generateSlug('Ngoài nước') || categorySlug === 'quoc-te' || categorySlug === generateSlug('Quốc tế')) {
      categoryName = 'Ngoài nước';
    } else {
      categoryName = categorySlug; // fallback
    }

    // Determine region and province by searching metadata
    const categoryData = categoryName === 'Trong nước' ? filtersMeta.domestic : filtersMeta.international;
    if (categoryData && Array.isArray(categoryData)) {
      if (regionSlug) {
        const foundRegion = categoryData.find((r: any) => generateSlug(r.region) === regionSlug);
        if (foundRegion) {
          regionName = foundRegion.region;
          
          if (categoryName === 'Trong nước') {
              const provinceSlug = slug.length > 2 ? slug[2] : null;
              if (provinceSlug && foundRegion.destinations) {
                 const foundProv = foundRegion.destinations.find((pName: string) => generateSlug(pName) === provinceSlug);
                 if (foundProv) {
                   provinceName = foundProv;
                 }
              }
          } else {
              // International
              const countrySlug = slug.length > 2 ? slug[2] : null;
              const provinceSlug = slug.length > 3 ? slug[3] : null;
              
              if (countrySlug && foundRegion.countries) {
                  const foundCountry = foundRegion.countries.find((c: any) => generateSlug(c.country) === countrySlug);
                  if (foundCountry) {
                      if (provinceSlug && foundCountry.destinations) {
                          const foundProv = foundCountry.destinations.find((pName: string) => generateSlug(pName) === provinceSlug);
                          if (foundProv) {
                              provinceName = foundProv;
                          }
                      } else {
                          // If no province specified, use country name for location filter
                          provinceName = foundCountry.country;
                      }
                  }
              }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching metadata for slug translation', error);
  }

  // Build new search params overriding with URL values
  const newSearchParams: any = { ...(await props.searchParams) };
  if (categoryName) newSearchParams.category = categoryName;
  if (regionName) newSearchParams.region = regionName;
  if (provinceName) newSearchParams.location = provinceName; // In frontend, 'location' parameter means Province/Country

  return <ToursPage searchParams={Promise.resolve(newSearchParams)} />
}
