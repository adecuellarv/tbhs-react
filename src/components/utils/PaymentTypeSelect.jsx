
const opcionesSolas = [
  { id: 1, nombre: "Efectivo" },
  { id: 2, nombre: "Cheques" },
  { id: 4, nombre: "Transferencia" },
];

const PaymentTypeSelect = ({ banks = [], value, onChange, id = "tipo-pago", label = "Tipo de pago", className = "", }) => {

  const debito = banks.map((b) => ({
    id: b.id_com_bancaria,
    nombre: `D. ${b.nombre_banco}`,
    comision: b.com_td,
    tipo_pago: "Tarjeta de Débito",
  }));

  const credito = banks.map((b) => ({
    id: b.id_com_bancaria,
    nombre: `C. ${b.nombre_banco}`,
    comision: b.com_tc,
    tipo_pago: "Tarjeta de Crédito",
  }));

  const handleChange = (e) => {
    const opt = e.target.selectedOptions?.[0];
    const payload = {
      value: e.target.value,
      label: opt ? (opt.textContent || "").trim() : "",
      tipo: opt?.dataset?.tipo || "",
      comision: opt?.dataset?.comision ?? null,
      dataType: opt?.dataset?.tipovalue || ""
    };
    onChange?.(payload, e);
  };

  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={id}
        className="mb-1.5 text-gray-600 font-medium"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={handleChange}
        className="h-11 w-full rounded-md border border-gray-300 px-3 text-gray-800 bg-white
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        {/* Opciones sueltas */}
        {opcionesSolas.map((o) => (
          <option key={`solo-${o.id}`} value={o.id} data-tipo={o.nombre}>
            {o.nombre}
          </option>
        ))}

        {/* Tarjeta débito */}
        {debito.length > 0 && (
          <optgroup label="Tarjeta débito">
            {debito.map((h) => (
              <option
                key={`deb-${h.id}`}
                value={h.id}
                data-comision={h.comision}
                data-tipo={h.tipo_pago}
                data-tipovalue="5"
              >
                &nbsp;&nbsp;{h.nombre}
              </option>
            ))}
          </optgroup>
        )}

        {/* Tarjeta crédito */}
        {credito.length > 0 && (
          <optgroup label="Tarjeta crédito">
            {credito.map((h) => (
              <option
                key={`cred-${h.id}`}
                value={h.id}
                data-comision={h.comision}
                data-tipo={h.tipo_pago}
                data-tipovalue="3"
              >
                &nbsp;&nbsp;{h.nombre}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
}

export default PaymentTypeSelect;