import React from "react";

const Reviews = () => {
    

    return (
        <div className="bg-gray-50 py-16 px-4">

           <section class="bg-base-100 py-16 px-6">
  <div class="max-w-7xl mx-auto">

    {/* <!-- Top Content --> */}
    <div class="grid md:grid-cols-2 gap-10 items-center mb-12">
      
      {/* <!-- Left Text --> */}
      <div>
        <h2 class="text-3xl md:text-4xl font-bold leading-snug">
          We Make Tech,<br /> for Privacy.
        </h2>
        <p class="text-gray-500 mt-3">
          We are customer centric team.
        </p>
      </div>

      {/* <!-- Stats --> */}
      <div class="grid grid-cols-3 gap-6 text-center">
        
        <div>
          <div class="text-primary text-2xl mb-2">🎯</div>
          <h3 class="text-2xl font-bold">950,000+</h3>
          <p class="text-sm text-gray-500">Active tags</p>
        </div>

        <div>
          <div class="text-secondary text-2xl mb-2">📈</div>
          <h3 class="text-2xl font-bold">4x</h3>
          <p class="text-sm text-gray-500">Revenue Growth</p>
        </div>

        <div>
          <div class="text-accent text-2xl mb-2">⭐</div>
          <h3 class="text-2xl font-bold">98.7%</h3>
          <p class="text-sm text-gray-500">Customer Satisfaction</p>
        </div>

      </div>
    </div>

    {/* <!-- Testimonials --> */}
    <div class="grid md:grid-cols-4 gap-6">

      {/* <!-- Card 1 --> */}
      <div class="card bg-base-200 shadow-sm p-6">
        <div class="text-warning mb-2">★★★★★</div>
        <p class="text-sm text-gray-600 mb-4">
          Good idea and execution..need to add option for calling also using virtual number system.
        </p>
        <span class="text-sm font-medium">Google Review</span>
      </div>

      {/* <!-- Card 2 --> */}
      <div class="card bg-base-200 shadow-sm p-6">
        <div class="text-warning mb-2">★★★★★</div>
        <p class="text-sm text-gray-600 mb-4">
          A must have for all vehicles. More and more people should start using this.
        </p>
        <span class="text-sm font-medium">Amazon Customer</span>
      </div>

      {/* <!-- Card 3 --> */}
      <div class="card bg-base-200 shadow-sm p-6">
        <div class="text-warning mb-2">★★★★★</div>
        <p class="text-sm text-gray-600 mb-4">
          I love it. it's a wonderful product now u don’t have to leave your number.
        </p>
        <span class="text-sm font-medium">Amazon Customer</span>
      </div>

      {/* <!-- Card 4 --> */}
      <div class="card bg-base-200 shadow-sm p-6">
        <div class="text-warning mb-2">★★★★★</div>
        <p class="text-sm text-gray-600 mb-4">
          Good idea and execution..need to add option for calling also using virtual number system.
        </p>
        <span class="text-sm font-medium">Google Review</span>
      </div>

    </div>

  </div>
</section>
        </div>
    );
};

export default Reviews;