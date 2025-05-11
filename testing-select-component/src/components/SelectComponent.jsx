import React, { useState } from "react";
import { Select } from "../../../src";

const SelectComponent = () => {
  const [selectedCountry, setSelectedCountry] = useState("");

  const countryOptions = [
    { label: "United States", value: "us" },
    { label: "Canada", value: "ca" },
    { label: "United Kingdom", value: "uk" },
    { label: "Australia", value: "au" },
    // { label: "Germany", value: "de" },
    // { label: "France", value: "fr" },
    // { label: "Japan", value: "jp" },
    // { label: "China", value: "cn" },
    // { label: "India", value: "in" },
    // { label: "Brazil", value: "br" },
    // { label: "Mexico", value: "mx" },
    // { label: "South Africa", value: "za" },
    // { label: "Spain", value: "es" },
    // { label: "Italy", value: "it" },
    // { label: "Netherlands", value: "nl" },
  ];

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px", padding: "20px" }}>
      <h1>Country Selector</h1>
      <Select
        label="Select Country"
        value={selectedCountry}
        onChange={handleCountryChange}
        options={countryOptions}
        placeholder="Search countries..."
        required
      />
      <div style={{ height: "200px" }}></div>
      {selectedCountry && (
        <div style={{ marginTop: "20px" }}>
          <p>
            You selected:{" "}
            {countryOptions.find((c) => c.value === selectedCountry)?.label}
          </p>
        </div>
      )}
      <h2 style={{ marginTop: "40px" }}>Examples with Different States</h2>
      <Select
        label="Disabled Dropdown"
        value=""
        onChange={() => {}}
        options={countryOptions}
        disabled
      />
      <Select
        label="Error State"
        value=""
        onChange={() => {}}
        options={countryOptions}
        error
        helperText="Please select a country"
      />
      <div style={{ height: "200px" }}></div>{" "}
      <div style={{ height: "200px" }}></div>
      <Select
        label="Pre-selected Value"
        value="jp"
        onChange={() => {}}
        options={countryOptions}
      />
      <Select label="Empty Options" value="" onChange={() => {}} options={[]} />
    </div>
  );
};

export default SelectComponent;
