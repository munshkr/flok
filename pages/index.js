import React from "react";
import FlockScene from "../components/FlockScene";
import Layout from "../components/Layout";

const IndexPage = () => (
  <Layout>
    <section className="section">
      <div className="container">
        <h1 className="title">flok</h1>
        <h3 className="subtitle">collaborative live coding editor</h3>
      </div>
    </section>
    <FlockScene />
  </Layout>
);

export default IndexPage;
