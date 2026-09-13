import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Qué datos recolecta Terror en Corto y cómo se usan.",
};

export default function PrivacidadPage() {
  return (
    <main className="max-w-2xl mx-auto px-8 py-16">
      <span className="font-mono text-xs tracking-widest text-blood uppercase block mb-4">
        Aviso de privacidad
      </span>
      <h1 className="font-display text-3xl mb-8">Qué hacemos con tus datos</h1>

      <div className="flex flex-col gap-8 text-bone-dim leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-bone mb-2">Qué recolectamos</h2>
          <p>
            Al crear una cuenta guardamos tu correo, tu nombre de usuario y, si subes una,
            tu foto de perfil. Si envías un testimonio, guardamos su contenido, la categoría
            que elegiste y si autorizaste su uso en el canal de YouTube. Si votas en un
            concurso, guardamos por cuál corto votaste y el mensaje corto que quieras dejar.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone mb-2">Cómo se usa</h2>
          <p>
            Usamos estos datos para operar el sitio: mostrar tu perfil, moderar y publicar
            historias, contar votos y evitar que alguien vote dos veces. No vendemos tus
            datos a nadie ni los usamos para publicidad dirigida.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone mb-2">Modo incógnito</h2>
          <p>
            Si publicas una historia en modo incógnito, tu nombre de usuario no se muestra
            públicamente — pero sigue asociada a tu cuenta internamente, para que podamos
            moderarla y para que puedas verla en tu propio expediente.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone mb-2">Con quién la compartimos</h2>
          <p>
            Usamos <strong className="text-bone">Supabase</strong> para guardar la base de
            datos y manejar el inicio de sesión, <strong className="text-bone">Cloudflare
            Turnstile</strong> para verificar que no eres un bot al registrarte o enviar una
            historia, y <strong className="text-bone">Google Analytics</strong> para entender
            cuánta gente visita el sitio y qué páginas lee. Ninguno de estos servicios recibe
            más datos de los necesarios para su función.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone mb-2">Tus opciones</h2>
          <p>
            Si quieres que eliminemos una historia que enviaste, o tu cuenta por completo,
            escríbenos a{" "}
            <a href="mailto:contacto@terrorencorto.com" className="text-amber hover:underline">
              contacto@terrorencorto.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
