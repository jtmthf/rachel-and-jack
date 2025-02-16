type Props = {
  children: React.ReactNode;
};

export default function OurStory({ children }: Props) {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-[48rem] px-4">
        <h2 className="mb-12 text-center text-4xl font-bold">Our Story</h2>
        <p className="mb-2 ml-2 text-xl font-semibold">October 14th, 2020</p>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 h-full w-1 -translate-x-1/2 transform bg-primary" />
          {children}
        </div>
        <p className="mb-12 ml-2 mt-2 text-xl font-semibold">
          September 6th, 2025
        </p>
      </div>
    </section>
  );
}
