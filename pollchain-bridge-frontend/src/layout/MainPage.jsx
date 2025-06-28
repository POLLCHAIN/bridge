import Hero from "../sections/mainpage/Hero";
import WhyChooseUs from "../sections/mainpage/WhyChooseUs";
import SupportNetwork from "../sections/mainpage/SupportNetwork";
import HowItWorks from "../sections/mainpage/HowItWorks";
import Footer from "../sections/mainpage/Footer";

const MainPage = () => {
  return (
    <div className="w-full bg-[#030B17] text-white font-onest">
      <Hero />
      <WhyChooseUs />
      <SupportNetwork />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default MainPage;
