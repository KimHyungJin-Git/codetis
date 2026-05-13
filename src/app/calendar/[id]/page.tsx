import CalendarDetailClient from './CalendarDetailClient';

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function Page() {
  return <CalendarDetailClient />;
}
