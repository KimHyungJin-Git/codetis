import ContactDetailClient from './ContactDetailClient';

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function Page() {
  return <ContactDetailClient />;
}
