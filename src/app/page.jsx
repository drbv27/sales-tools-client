//src/app/page.jsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/main/leads');
}