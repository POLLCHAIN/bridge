import BridgeWindow from "../components/BridgeWindow";
import Navbar from "../components/Navbar";
import Footer from "../sections/mainpage/Footer";

export default function Bridge() {
  return (
    <section className="flex flex-col text-center bg-[url('/images/hero-section/bg.png')] bg-no-repeat bg-cover bg-bottom font-onest">
      <Navbar />
      <div className="w-full flex flex-col justify-center items-center mt-16 mb-16">
        <BridgeWindow active />
      </div>
      <Footer bridge={true} />
    </section>
  );
}
