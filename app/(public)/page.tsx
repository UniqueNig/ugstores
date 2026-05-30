import Footer from "@/src/components/layout/Footer";
import Navbar from "@/src/components/layout/Navbar";
import HomepageSections from "@/src/sections/HomepageSections";

// Re-fetch homepage data (categories) at most once a minute so newly added
// categories show up without a redeploy.
export const revalidate = 60;

// The homepage is now DATA-DRIVEN: the set and order of sections come from
// siteConfig.homepageSections (src/config/site.ts), rendered via the section
// registry. To change the homepage, edit that array — no JSX changes here.
const Home = () => {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <HomepageSections />
      <Footer />
    </main>
  );
};

export default Home;
