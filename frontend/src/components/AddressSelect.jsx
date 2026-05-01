const AddressSelect = ({ addresses, value, onChange, label = 'Address' }) => (
  <label className="flex h-10 min-w-[14rem] flex-1 items-center gap-2 rounded-md bg-white px-3 text-sm ring-1 ring-line">
    <span className="shrink-0 text-xs font-semibold uppercase tracking-normal text-slate-400">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none"
    >
      {addresses.map((address) => (
        <option key={address.email} value={address.email}>
          {address.email}
        </option>
      ))}
    </select>
  </label>
);

export default AddressSelect;
