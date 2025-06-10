import React from 'react'
import { Layout } from "../components/Layout";
import { MyBooks } from '../components/MyBooks';
import GenreManagement from '../components/GenreManagement ';
function MyGenre() {
  return (
    <Layout>
        <GenreManagement/>
    </Layout>
  )
}

export default MyGenre