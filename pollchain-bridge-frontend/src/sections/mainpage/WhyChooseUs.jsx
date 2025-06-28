import GradientBorderButton from '../../components/GradientBorderButton';

const WhyChooseUs = () => {
  return (
    <section className="py-20 px-4 text-center bg-[url('/images/why-choose-us-section/bg.png')] bg-no-repeat bg-cover bg-left md:bg-top">
      <h1
        // initial={{ opacity: 0 }}
        // whileInView={{ opacity: 1 }}
        // transition={{ duration: 0.5 }}
        // viewport={{ once: true }}
        className="text-3xl md:text-4xl font-bold"
      >
        Why Choose Our Bridge?
      </h1>
      <h2 className="w-full text-xl md:text-2xl font-semibold mt-6 text-white/70">
        Simple. Direct and Effective.
      </h2>
      <p className="w-full text-base mt-6 text-white/50 px-3 md:px-52">
        Experience the difference of a bridge built for your needs.
        We combine cutting-edge technology ith user-centric design
        to offer an unparalleled cross-chainn swapping experience
      </p>

      <div className="mt-10 w-full flex flex-col justify-center items-center">

        <div className="flex flex-col md:flex-row justify-center items-center gap-20 max-w-5xl">
          {[
            { icon: 'service-1', title: 'Fixed & Transparent Ratio', desc: "Say goodbye to unexpected slippage. Enjoy predictable swaps with our secure, fixed 1:5 exchange rate, ensuring you always know what you'll receive." },
            { icon: 'service-2', title: 'Minimal Fees', desc: 'Maximize your assets with our exceptionally Low 0.1% transaction fee, making your cross - chain transfers more cost - effective.' },
            { icon: 'service-3', title: 'Unwavering Security', desc: 'Your assets are top priority. Our bridge is protected by a robust multi-sig setup, advanced replay protection, and undergoes rigorous security audits to ensure peace of Mind.' }
          ].map((item, idx) => (
            <GradientBorderButton
              key={idx}
              enableHoverScale={false}
              isActive={false}
              onClick={null}
              direction='vertical'
            >
              <div className="flex flex-col justify-center items-center text-center space-y-4">
                <img
                  className='w-8'
                  src={`/images/why-choose-us-section/${item.icon}.png`}
                  alt={item.title}
                />
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            </GradientBorderButton>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-20 mt-10 max-w-5xl pr-0 md:max-w-3xl md:pr-24">
          {[
            { icon: 'service-4', title: 'Dedicated & Reliable', desc: 'Specifically designed for seamless transfers of POLL token (ERC20) and POLL token (BEP 20) Networks, providing a specialized and highly effective solution.' },
            { icon: 'service-5', title: 'Lightning - Fast Transfers', desc: "Don't Wait. Our optimized system ensures your tokens are bridge swiftly, appearing in your destination wallet in moments." }
          ].map((item, idx) => (
            <GradientBorderButton
              key={idx + 3}
              enableHoverScale={false}
              isActive={false}
              onClick={null}
              direction='vertical'
            >
              <div className="flex flex-col justify-center items-center text-center space-y-4">
                <img
                  className='w-8'
                  src={`/images/why-choose-us-section/${item.icon}.png`}
                  alt={item.title}
                />
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            </GradientBorderButton>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
