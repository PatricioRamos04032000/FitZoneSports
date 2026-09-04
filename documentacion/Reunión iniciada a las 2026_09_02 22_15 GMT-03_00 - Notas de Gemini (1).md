sept 3, 2026

## **Reunión del 2 sept 2026 a las 22:15 GMT-03:00 \- Transcripción**

### **00:00:46**

**Patricio Ramos:** Bueno, bueno, entonces la idea era presentar entonces el trelo ahí, ¿no? Bien,

**Matias Goncevat:** Sí.

**Patricio Ramos:** entonces nada, eh ustedes pueden ver acá sus tareas. Si quieres filtrar, te va a aparecer tareas asignadas a, en este caso es para mí, pero le va a aparecer para ustedes. Y acá van a ver que unas tienen el título y acá abajo 12 de septiembre y otras que dicen 5 de septiembre, como para diferenciar no más las que son de una semana y de la otra. Por ejemplo,

**Matias Goncevat:** Bien.

**Patricio Ramos:** lo último que que va en orden acá, 05, una reunión grupal para cerrar decisiones, eh registrar acuerdos de la reunión, eso me toca a mí, actualizar el C4, bueno, cosas así y así con ustedes. Eh, ¿alguno ya pudo ver algo?

**Matias Goncevat:** No, yo sinceramente

**Lucas Coquet:** Yo no todavía No.

**Bruno Conti:** No, no, no tenía mucho tiempo.

**Patricio Ramos:** Okay,

**Bruno Conti:** Oh.

**Patricio Ramos:** todavía nadie tomó nada.

**Matias Goncevat:** Consulta.

**Patricio Ramos:** Bueno,

**Matias Goncevat:** Eh, con toda la feria que tenemos nosotros trabajaríamos el repo de git.

**Patricio Ramos:** sí, sí, sí.

### **00:02:24**

**Patricio Ramos:** El grupo de Git ahora tiene, tenés que bajarte no más porque tiene más que nada la documentación relacionada con las tareas. O sea, una tarea es revisar la C4, otra es revisar las funcionalidades por actor, otra es revisar el stack tecnológico, ver si hay observaciones o cosas de alucinaciones de la IA y cosas para

**Matias Goncevat:** Mhm.

**Patricio Ramos:** definir.

**Matias Goncevat:** Oh.

**Patricio Ramos:** Solo revisar más adelante. Ante hay cosas como, yo que sé,

**Matias Goncevat:** Ok.

**Patricio Ramos:** completar tablas de integrantes con nombre de roles. Eso lo puedo hacer yo tranquilamente. Igual está asignado al P4. Es cómo eso. Nada, desde el tro preguntando en WhatsApp no más por el nombre completo de cada uno y comparando acá cuál es lo que se le asigna a cada uno. Por son solo tres, tres integrantes acá. P1, P2, P3 y P4. Creo que acá en el plan en el Sí, acá pueden comparar, puedes comparar así 1 P1,

**Matias Goncevat:** Ok.

**Patricio Ramos:** P2, P3 y P4 por ejemplo. Eh, bueno, déjame revisar. Tenemos una pequeña agendita. si podemos definir cosas rápido, más o menos acá.

### **00:04:10**

**Patricio Ramos:** Eh, lo que ya está cerrado, solo para ratificar, no más, para repetir algo que se supone que ya sabemos. A ver, la arquitectura es un modelito modular de la aplicación. El stack va a ser Nest más React más Type Scrept. Bueno, Type Screed es porque se usa, supongo, en NES o en React y Supabase para la base de datos. La autenticación. Esto no sé si lo comenté o solo me lo noté. Esto le mostré al profe la idea acá del C4 donde

**Matias Goncevat:** Mhm.

**Patricio Ramos:** decía, déjame ver, el está acá en el backen, uno de los módulos, aparte de los de usuario, gimnasio y clase, va a haber un módulo de autenticación, nada que se va a encargar del JWT. Eso me dijo el profe, mira, pueden usar directamente lo que es autenticación de Supase, que Supabase se encarga de las autenticaciones. Ya tiene una funcionalidad que se puede usar y lo único que haríamos

**Matias Goncevat:** Mhm.

**Patricio Ramos:** nosotros es en este módulo que va a existir en nuestro repositorio autenticación seguridad, va a ser solo como una pasarela. Sí, que va a conectar el front con la base de datos y la base de datos se va a encargar de hacer todas esas autenticaciones de usuarios.

### **00:05:54**

**Patricio Ramos:** sería.

**Bruno Conti:** M.

**Patricio Ramos:** Esa fue la idea que tiró el profe para no hacer nosotros toda la lógica de autenticación desde cero en el módulo autenticación. Como relegar eso a la base de datos. todo el manejo, manejo de tokens,

**Matias Goncevat:** Bien,

**Patricio Ramos:** vencimientos y autenticaciones.

**Matias Goncevat:** para que todo se encargue entonces y nosotros lo hacemos en

**Patricio Ramos:** El módulo de autenticación que solo va a ser como un pasamanos,

**Matias Goncevat:** internet

**Patricio Ramos:** o sea, solo lo vamos a consumir las funciones que nos dé suabase. Eh, bueno, datos API Supase a esto también. La capa de repository, acceso a datos vía cliente Supabase. Esto también habló el profe, mencionó, podemos hacer la capa de repository tanto nosotros como hacer un ORM, un modelo de datos de objeto relacional o Supase tiene una API en la que nosotros directamente consumimos esa API y mandamos a hacer eh suponiendo mandando datos en Jason. decir le digo,"Bueno, guardame u una reserva, guardame una CD, guardame algo, pero ya no sería un update, un delete, sería un, ¿cómo es esto? Un post, un put, todo eso, comunicación tipo API.

**Matias Goncevat:** Ok.

### **00:07:38**

**Patricio Ramos:** Eh, eso dijo porque puede tardar más esto en hacerse el ORM. lo mismo que, o sea, es aprovechar lo que te da su pabase para eh para hacerlo más rápido, supongo, al desarrollo.

**Matias Goncevat:** Bien.

**Patricio Ramos:** Bueno, canal web multirol a un A4 móvil React Native en unidad 6\.

**Matias Goncevat:** He.

**Patricio Ramos:** Esto de canal creo que se refiere a por web, por la aplicación web, por el navegador va a poder interactuar tanto el usuario normal como el administrador, el gerente y el recepcionista. Y nada, el la app móvil va a ser React Native, pero no la vamos a a pensar o no la vamos a modelar hasta recién llegados a la unidad, si llegamos a dar la unidad de aplicación móvil. Ah, offline. Esto es checkin de sede, no solo QR en el celu. Em. M. pensar cómo hacer nosotros el manejo de de login, sería, ¿no? el el acceso a los gimnasios para los miembros sería manejar algún tipo

**Matias Goncevat:** Sí, con todo el tema del QR y la

**Patricio Ramos:** de decime,

**Matias Goncevat:** actualización.

**Patricio Ramos:** Mati,

**Matias Goncevat:** Ah, no, que ahora dice no solo QR. Claro, puede ser con método de

### **00:09:32**

**Lucas Coquet:** Y número de documento podría ser en mi gimnasio.

**Matias Goncevat:** validación.

**Lucas Coquet:** Antes tenía número de documento, después agregó QR. Eran ambas opciones, digamos.

**Patricio Ramos:** Esto más que nada porque podés hacer checkin sería y algo

**Matias Goncevat:** Hm.

**Patricio Ramos:** que se había mencionado es está bien, suponeste que vos tenés el celular, la aplicación en el celular te va a generar un QR. El recepcionista del del gimnasio va a poder con una camarita leer el QR de tu celular, va a poder hacer checkin. Ahora, el después, ¿cómo se maneja eso offline? El el checkin sería se podía haber visto como un tipo de algoritmo, algo que se pueda calcular, que digas, bueno, esto es eh, ¿cómo se llama? Esto es válido. Este QR que me presenta este cliente es válido. Y algo tiene que ver con, yo que sé, una especie de código secreto que vos podés guardar en la aplicación y que está atado, la generación del QR sería está atada a un algoritmo que toma el tiempo, o sea, la hora y los minutos y los segundos del dispositivo. Entonces, como que cada minuto te va a generar por ese mismo algoritmo va a pasar un una llavecita y eso lo va a tener tanto el celular del cliente, sería del usuario, el miembro, como el lugar donde del gimnasio, la computadora del gimnasio.

### **00:11:25**

**Patricio Ramos:** Entonces, lo único que va a hacer es leer ese código QR. dice,"Che, esto que me entregó, este código que me entregó este cliente es válido. Si yo lo desencripto o mejor dicho yo lo recreo con lo que yo tengo en mi base de datos, suponerte local de la aplicación y los comparo, eh, son los mismos, sería por ahí andaba la onda de poder hacer un checkin, viste, con toda Yeah.

**Bruno Conti:** Yeah.

**Patricio Ramos:** cosa que quería el profe de que se regenere cada minuto, que vaya cambiando y cosas así, eh,

**Lucas Coquet:** Claro,

**Patricio Ramos:** a pesar de que no haya internet,

**Lucas Coquet:** encima también tiene que hacerse la pregunta de si de si

**Patricio Ramos:** sería

**Lucas Coquet:** no fue ya escaneado en el mismo día en otra sede, porque había un tema que decía, viste,

**Patricio Ramos:** No, no se puede,

**Lucas Coquet:** que no se puede estar al mismo tiempo,

**Patricio Ramos:** no se puede.

**Lucas Coquet:** entonces hay que trabajar eso.

**Matias Goncevat:** Bueno,

**Patricio Ramos:** es una limitante que ya sabemos offline no hay

**Lucas Coquet:** Mhm.

**Patricio Ramos:** forma de saber si otra persona entró, o sea, si la misma persona entró en otra sucursal offline tenemos que definir que,

**Matias Goncevat:** Igual

**Patricio Ramos:** che, te puedo hacer la autenticación offline, pero no puedo saber qué pasa al otro lado de la provincia en otro en otro sistema porque no estoy eh con conexión internet.

### **00:12:51**

**Matias Goncevat:** vamos otro detalle. Las veces que pase eso de estar en estado offline va a ser una vez cada mucho tiempo. O sea, sería muy contado con los dedos de la mano por decirte. No es que va a tener día por medio o todos los días se le va a cortar el internet justo y va a hacer

**Patricio Ramos:** Claro.

**Matias Goncevat:** registros offline constantemente.

**Patricio Ramos:** Bueno, es era uno de los problemáticas y qué conlleva que el sistema pueda hacer este checkin de sede a nivel sede, a nivel local. sin internet, ¿entendés?

**Matias Goncevat:** Mm.

**Patricio Ramos:** Eh, nada, eso se puede seguir, no llegamos hasta ese punto, pero se puede seguir viendo, pero se está masticando ya esto de que localmente se va a hacer con algún tipo de

**Matias Goncevat:** Ok.

**Patricio Ramos:** algoritmo y algún tipo de secreto y el hosting nada. Versel, render Supase, GitHub para el código del repositorio. Eh, decisiones importantes. Ya son:30. Bueno,

**Matias Goncevat:** Sí.

**Patricio Ramos:** a las 11 los libero si no tienen algo más que hacer. No se supone que la reunión sea tan larga. Em, organización del equipo.

### **00:14:10**

**Patricio Ramos:** ¿Quién es P1, P2? Bueno, esto ya lo pueden el que está encargado porque creo que hay una tarea de eso. E nada, se puede fijar en acá lo mismo, las tareas, el plan de trabajo de P1, P, P3, P4, fijarse acá y creo que está acá 1 2 3 4\. Igual eso para que no se queje. Creo que está acá en esto. GitHuby, nombre. nombre GitHub de contacto. Creo que por eso se quejó no más. Mono repo o multirpo e por ahora mono repo, hasta donde yo sé, solo creamos una carpeta que se llame frontend para alojar la aplicación.

**Bruno Conti:** Yeah.

**Patricio Ramos:** Yeah. de front y otra de backend para alojar la aplicación de backend para no hacerla complicada de tener dos repos. Em,

**Matias Goncevat:** Pero vos estás hablando en repo en cuanto al proyecto decir vos o las ramas que vos puedes generar dentro del

**Patricio Ramos:** no, eso no importa.

**Matias Goncevat:** proyecto.

**Patricio Ramos:** Las ramas no importa el proyecto como carpeta, como repositorio de GitHub,

**Matias Goncevat:** Sí,

**Patricio Ramos:** donde vos lo vas a descargar.

**Matias Goncevat:** es una sola.

**Patricio Ramos:** es uno solo.

### **00:15:30**

**Patricio Ramos:** Vamos a tener una carpetita al lado de documentación que se va a llamar front y otra que se va a llamar back y ahí

**Matias Goncevat:** Claro,

**Patricio Ramos:** van adentro de esas van a ver sus sus desarrollos de

**Matias Goncevat:** pero dentro del proyecto que es el

**Patricio Ramos:** proyecto. Sí, sí, por simpleza más que nada.

**Matias Goncevat:** Portamos

**Patricio Ramos:** Convención de ramas y prs. Feature. ¿Quién merchea? ¿Quién tendría que tener los permisos y quién merchea a main todo lo que lo que se desarrolla y se sube para evitar pisar pisarse el empear código? Esto sería hoy en día no tenemos ninguna rama de desarrollo como tal. tenemos la rama principal donde se está haciendo la documentación del proyecto. Podríamos tener dejar esta rama principal y hacer una rama aparte

**Matias Goncevat:** Mhm.

**Patricio Ramos:** llamada desarrollo, suponete, solamente para subir código por ahora de lo que sería el frontend y el backend. Y en esa rama de desarrollo eh cada uno va a ir subiendo sus e, ¿cómo se llama?, sus cambios. Normalmente para seguir la trazabilidad de esas cosas se se asigna un código de tarea, no se hace todo este choclo de de título. E se puede usar esto tranquilamente, suponete como propuesta.

### **00:17:16**

**Patricio Ramos:** A ver si está acá, acá una una rama. que diga, mira, Lucas trabajó en esta rama llamada ST1 T03, semana 1, tarea 3\. Dentro le pones una descripción que dice revisar funcionalidades por actor. Ah, mira, creo que esto tengo para fijar fijar acá en GitHub. Vamos a fijar eh Fitzone. Hoy en día solo está la rama master, supone.

**Matias Goncevat:** Bien.

**Patricio Ramos:** ponente y todos los comits. Sí. Y hoy en día tenemos esto, un comit llamado create plan de trabajo document. Entonces, esto es una pequeña descripción que se le agrega a cada push, donde acá sí podés esplasarte, decir, bueno, se hizo tal cosa, se hicieron tales cosas, se agregó más funcionales a la API, se documentó la API, se hizo la tal parte de frontend. Entonces, la idea sería convención de ramas, eh,

**Matias Goncevat:** Sí.

**Patricio Ramos:** ¿cómo es esto? tener una rama de desarrollo, lo mínimo por ahora, una rama de desarrollo y cuando toque el momento igual de que cada uno empiece a tocar el repo documentación no importa tanto, pero con cosas del código ya empezar a trabajar en las aplicaciones. Eh, se hagan una ramita donde el nombre de la rama sea un pequeño código trazable, así.

### **00:19:19**

**Patricio Ramos:** S1-03 y en la descripción cuando hagan un comid, un push te dice, mira, revisar funcionalidades por actor, revisar decisiones. E por eso por ese lado, eso está bueno. ¿Quién administra cada cuenta? GitHub, Supase, Versel y Render. Esto para empezar a verlo la semana que viene, o sea, para empezar con los trabajos de la semana que viene, si llegamos. Eh, por ahora, GitHubs, yo solo tengo el repositorio no más que eh que tengo acceso, pero después no hay nada hecho para Supasel o render. No sé si alguno ya vio estas herramientas o quiere dedicarse un rato a, o sea, decir si yo me encargo de, yo que sé, hacer la cuenta de base, subir el proyecto o armar la base de base,

**Lucas Coquet:** Yo no lo he visto,

**Patricio Ramos:** por favor.

**Lucas Coquet:** pero lo que toque me miro los videos de YouTube que hagan falta. Yeah.

**Patricio Ramos:** Bueno, eh, ¿quién es el que salió? Elite,

**Bruno Conti:** Yeah.

**Patricio Ramos:** Lucas o fuiste Bruno? No lo reconozco todavía por vos.

**Lucas Coquet:** Ah, hablé yo. Hab yo.

**Matias Goncevat:** Lucas

**Patricio Ramos:** Okay. Quedó que Lucas estaba después.

### **00:21:07**

**Lucas Coquet:** Crear cuenta de Superbase. Entonces,

**Patricio Ramos:** La idea es si vos creas si vos te creas la cuenta de Supase, ya tendrías que encargarte de armar o inicializar la base y ya está ahí nada más. O sea, después vamos a tener que que trabajar no más en crear tablas y volverse así, pero en decir que che,

**Matias Goncevat:** M.

**Patricio Ramos:** la base de su base le pertenece a Lucas. Lucas tiene permisos de eh dar permisos a los demás. sería eh lo que es ver y render es lo mismo. Bueno, nada, por ahora solo voy a encargar yo. Igual todavía no tenemos nada hecho, pero es solo hacer la cuenta y ver un par de videos de cómo empezar a usarlo.

**Matias Goncevat:** M.

**Patricio Ramos:** Eh, ¿cómo comparten secrets? Esto nunca en el repo el punto, que creo que esto me acuerdo del proyecto de programación 4, que ahí tenía definido toda la base de datos y creo que era el secret, ¿no? El secret del token,

**Matias Goncevat:** punto tenés guardado todo el proyecto ahí gestionado,

**Patricio Ramos:** algo así.

**Matias Goncevat:** o sea, la dirección a la base de datos con el usuario,

**Patricio Ramos:** Sí,

**Matias Goncevat:** con todo.

### **00:22:43**

**Matias Goncevat:** Eso nunca se tiene que en cierta forma dejar público.

**Patricio Ramos:** lo claro. Local más gestor de contraseñas dice acá. La otra vez en programación 4 no nos importa una chot. Lo subimos todo. La p\*\*\* madre. Em, supongo, no, no sé. Lo único que se me ocurre es tener un archivo punto en, pero acá en en el server de Discord, en algún lado del server de Discord, por lo menos de ahí copiar y pegar las configuraciones para decir, bueno, no están en el repo,

**Matias Goncevat:** Sí,

**Patricio Ramos:** pero tampoco sé qué más se puede hacer.

**Matias Goncevat:** sí repo de última driver que sea.

**Patricio Ramos:** A ver, entregable unidad un PDF de el modelo C4 más los ADRs. Dice,"El PDF incluye solo el modelo C4+ ADR o algo más.

**Bruno Conti:** M.

**Patricio Ramos:** M. Esto me lo tiene que confirmar el profesor si incluye también diagrama de clases y diagrama de entidad de relación porque el plan por ahora de esta semana y de la otra no incluye el diagramado de el estos estos estos diagramas sería si no nada se ve algo rápido, pero para no estar nerviosos

**Matias Goncevat:** para saber en cuánto lo que es el desarrollo del proyecto en sí, cuándo arrancarían.

### **00:24:32**

**Patricio Ramos:** desarrollo en sí. Unos chicos ya arrancaron hacer el diagrama, por ejemplo. O sea, hay unos que se dieron la red rosca y ya podrían estar tranquilamente desarrollando el backén, pero es más que nada porque eh ya saben

**Matias Goncevat:** a lo que me refiero. Tenemos que seguir esperando que el profesor nos dé algunas indicaciones.

**Patricio Ramos:** desarrollar.

**Matias Goncevat:** Podemos nosotros arrancar.

**Patricio Ramos:** Ahora se supone que en esta primeras dos semanas este plan se lo tengo que entregar más o menos cómo va cada uno que está haciendo cada

**Matias Goncevat:** Mhm.

**Patricio Ramos:** uno que logró hacer cada uno no sé si el jueves o el viernes e y no sé para cuándo no avisó todavía, pero la idea es terminar primero los los diagramas, el C4 y el ADR, los ADR como primera entregable y después recién se supone empezar el desarrollo de la aplicación, ya sea la próxima semana o la otra. Por eso estas semanas son solo de documentación y decisiones. Em, nada, eso. Eh, ¿quién exporta diagramas y arma el PDF? Fecha de entrega interna antes de la fecha de cátedra. Nada, eso puedo encargarme yo de armar. el PDF con los ADR y el C4 bien hecho en en el Archi, en el Archimate.

### **00:26:16**

**Matias Goncevat:** Mhm.

**Lucas Coquet:** Avis igual la última si es mucho y

**Patricio Ramos:** ¿Quiénes ha?

**Lucas Coquet:** dividimos.

**Patricio Ramos:** Por ahora no es mucho. Por ahora son cuatro o cinco tareas.

**Lucas Coquet:** Okay.

**Patricio Ramos:** Sí,

**Lucas Coquet:** Okay.

**Patricio Ramos:** estoy encargado de terminar esto de los o mejor dicho la apuesta en común de si la documentación está bien.

**Lucas Coquet:** Perdón, ¿para cuándo dijiste lo del ADR y eso? semana que viene.

**Patricio Ramos:** teóricamente no lo no pidió el entregable todavía, pero

**Lucas Coquet:** Okay, okay. Pasa que lo está desarrollando todavía.

**Patricio Ramos:** Sí. Em, nada. ¿Quiénes hacen la revisión cruzada? O sea, quiénes revisan lo que se supone que yo voy a vamos a presentar de C4 y ADR. En este caso la P1 y P2 y P3 que serían Bruno y Lucas. Eh, falta algo en el C4 y este caso sería BFF offline CD despliegue lista de cambios post reunión para PU. Bueno, esto lo puedo ver ahora después de la tranrip o mejor dicho mañana cómo afecta esas

**Matias Goncevat:** Oh.

**Patricio Ramos:** decisiones de eh lo que lo que presenté acá que es autenticación que va a ser una pasarela a suabase Y lo de repository que va a ser un cliente Supi, sino RM.

### **00:28:16**

**Patricio Ramos:** Nada. ¿Cómo afecta eso? El C4. Ah, y el manejo offline de la sede, eh, 45\. Nada. Arquitectura offline dice retoque de diseño importante sin código aún. No implementan de OTP esta semana, pero sí conviene cerrar el enfoque para el C4 y el PDF. Pregunta, adoptamos el patrón nodo por sede más cola más sincronización. Esto era por sede. Cada sede va a manejar sus propias e sus propios checkins sería. Vamos a tener guardado teóricamente en la aplicación una pequeña cola de gente que que fue entrando al al gimnasio mientras no había internet. Y después cuando vuelve el internet se supone que va a intentar sincronizar eso con los datos en el en la base de datos de la nube sería para intentar, yo que sé, ver que todo esté bien. Em, nada, pero eso era eso era una idea, por eso dice sí, ¿no? o ajustar como debería funcionar.

**Lucas Coquet:** debería andar, che. Esto es ese esta parte, de última silabel profe seguro te seguro nos ayuda con esto.

**Patricio Ramos:** de la parte

**Lucas Coquet:** Sí. O sea, esto que digo si que hay opciones, ¿sí? No ajustar.

**Patricio Ramos:** offline.

### **00:30:10**

**Lucas Coquet:** Eh, yo creo que si si lo ve el profe probablemente nos tire un ayudín, ¿no? Acá capaz es mejor esto, acá esto, acá lo otro,

**Patricio Ramos:** Bien.

**Lucas Coquet:** pero pero yo lo veo bien planteado. Sí.

**Patricio Ramos:** Eh, voy a ver si no nos salteamos estas cosas. Capaz entonces no va a ayudar más el profe de la arquitectura

**Matias Goncevat:** Ok.

**Patricio Ramos:** offline. Eh, autenticador para QR dinámico. ¿Dónde vi el nuevo local? El QR el SOS se muestra en el móvil o también en web para las demos. Teóricamente debería mostrarse el móvil, no tiene sentido que se muestre un web, pero bueno. E RN1, la sede, una sede a la vez. Ah, esto es una pregunta de cómo hacemos la lógica. para verificar que dos usuarios no intenten hacer un login en dos sedes distintas a la vez. sería. Entonces unos chicos le preguntaron al profe si porque se les complicaba por hacerlo

**Matias Goncevat:** M.

**Patricio Ramos:** por base de datos, o sea, manejar algún tipo de tabla con primary key que sea única y que solo un usuario pueda hacer una vez un login o un checkin, mejor dicho, un checkin al gimnasio a la vez hasta que yo que sé, se va, hace un checkout,

### **00:31:55**

**Matias Goncevat:** Mhm.

**Patricio Ramos:** se va al gimnasio. Se por lo que estuve viendo un poquito era o hacer lógica en la base de datos o hacer lógica en el backen o hacer una una híbrida que más o menos la IA

**Matias Goncevat:** Ok.

**Patricio Ramos:** orientó por ahí hacer una propuesta híbrida, tener algo por base de datos hecho, pero también tener lógica en el backen para eh consultar el cómo es esto, consultar esto de que no pueden hacer checkin dos

**Matias Goncevat:** Claro,

**Patricio Ramos:** veces.

**Matias Goncevat:** yo creo para lo que tiene una val, bueno, suponente que hay dos personas queriendo eh ingresar con el mismo código QR o lo que tengas, ¿no? verificación por la marca de tiempo con la base de datos que primero se registró, listo, automáticamente se registra ese ingreso, se bloquea que no pueda acceder a otra persona o Yeah.

**Bruno Conti:** M.

**Matias Goncevat:** o lo que sea durante, qué sé yo, mínimo una hora, hora y media que nos el tiempo que se están los gimnasios, creo yo.

**Patricio Ramos:** Bien, ese es también el siguiente punto. Necesita hacer un checkout. explícitamente, o sea, tiene que marcar que se va del del gimnasio o le agregamos un tiempo de espera, o sea, 4 a 6 horas para que decir, bueno, este esta persona ya se fue del gimnasio.

### **00:33:31**

**Matias Goncevat:** Y lo que pasa que vos ten pensarlo por dos formas, No, por un lado, por la persona que va por el tiempo que tiene pagado, digamos, el el gimnasio y otra, si te pones más adelante vas a ver de que vas a tener la reserva de cancha o reserva de clase y todo. Por ende, en el espacio físico vas a tener el espacio disponible base a las personas que estén ahí, ¿no? Entonces voy a decir, bueno, no sé si para las 5 de la tarde tengo que hacer una clase de screening y necesito tener 20 lugares disponibles y el gimnasio estaba rotado porque tenés 50 personas adentro, entonces por lógica, eso no te va a dar eh capaz que estoy mezcando muchas cosas acá, ¿no? Sí o sí vas a necesitar hacer un un time out para el tema de que la persona que que se va a

**Patricio Ramos:** Sí.

**Matias Goncevat:** ir del lugar de que se va y otra también es dar ese tiempo a decir, bueno, se bloquea la posibilidad de ingreso de registro por un tiempo determinado, que de hecho en realidad va a ser por el día, ¿no? Así, bueno, ya te regetaste una vez el día de hoy, listo, recién se va a reanudar mañana a las 8 de la mañana va a estar disponible o o en tal horario para evitar que la persona también vaya en otro horario, salvo que tenga, no sé, pago de horario libre o qué sé yo.

### **00:34:56**

**Matias Goncevat:** Sería cuestiones para para elar muy fino a a ver dependiendo del plan que tenga la persona

**Patricio Ramos:** Sí.

**Matias Goncevat:** y horario que tenga, qué sé yo, hay muchas formas de tratar de

**Lucas Coquet:** Sí,

**Matias Goncevat:** verlo.

**Lucas Coquet:** hay que tener cuidado con con hilar tan fino porque si hilamos fino,

**Patricio Ramos:** ¿Quién

**Lucas Coquet:** capaz una persona entrena doble turno el mismo día. Son excepciones, ¿no?

**Matias Goncevat:** Claro.

**Lucas Coquet:** Pero existen.

**Patricio Ramos:** te que va más de una vez al al gimnasio por día?

**Lucas Coquet:** Claro.

**Patricio Ramos:** Suponete.

**Lucas Coquet:** Por eso te digo doble turno sería lo mismo.

**Patricio Ramos:** Bien.

**Matias Goncevat:** Claro.

**Lucas Coquet:** Son excepciones, deben ser cinco personas

**Matias Goncevat:** mucho el

**Patricio Ramos:** No, no, che,

**Lucas Coquet:** menos.

**Patricio Ramos:** no, no podés volver a entrar, ¿eh? Ya cumpliste tu cuota.

**Matias Goncevat:** ejercicio.

**Patricio Ramos:** Solo puedes entrar una vez por

**Lucas Coquet:** Y y también depende a qué le,

**Patricio Ramos:** día.

**Lucas Coquet:** o sea, porque si le llamamos gimnasio de manera general, capaz alguien va a hacer musculación y después va a hacer otra actividad, porque viste que hay actividades también en el mismo día.

### **00:35:53**

**Matias Goncevat:** Claro.

**Patricio Ramos:** Acá hay una cosa que plantea Mati que me hace pensar porque no está escrito en Yeah.

**Matias Goncevat:** Ok.

**Patricio Ramos:** problema original que es,"Che, el gimnasio es una cosa parte de las canchas o es una cosa parte de las

**Lucas Coquet:** Claro,

**Patricio Ramos:** clases.

**Lucas Coquet:** claro.

**Patricio Ramos:** Una cancha, sí, digo, una cancha puede tener hasta 12 personas una cancha de fútbol dentro de un gimnasio.

**Lucas Coquet:** S.

**Patricio Ramos:** Suponete que exista algo así o una cancha de té." Ahora, un gimnasio, suponete que tenga un máximo de 50 personas y una clase de yoga que se haga en el mismo espacio del gimnasio y esa clase sea de 15 personas y obviamente vas a llegar a 50 personas y bueno, no vas a poder teóricamente no deberías o deberías avisar, che, ya pasaste las 50 personas. Acá el la clase del de yoga, no sé, debería cancelarse o algo porque está lleno. Nada, problemas de la vida real aplicados a

**Matias Goncevat:** Claro,

**Lucas Coquet:** Mhm.

**Matias Goncevat:** serían cuestiones para consultarlo más al profe a ver cómo abordamos el tema Porque fíjate que ya no estamos yendo

**Patricio Ramos:** un

**Matias Goncevat:** por la rama al sentido de pensar en el aspecto físico del gimnasio en cuanto a clases

### **00:37:07**

**Lucas Coquet:** Y

**Matias Goncevat:** o a canchas,

**Lucas Coquet:** llamemos Fitson a todo y después está Fitson cancha, Fitson gimnasio,

**Patricio Ramos:** h.

**Lucas Coquet:** Fitson disciplinas, yoga, todo lo que quier

**Matias Goncevat:** todo

**Lucas Coquet:** este,

**Patricio Ramos:** Bueno, nada,

**Lucas Coquet:** pero

**Patricio Ramos:** es está bueno, va a estar bueno.

**Lucas Coquet:** Sí.

**Patricio Ramos:** como consulta al profe, si más adelante cuando tengamos que implementar esto del login o mejor dicho si va a haber un límite, o sea, hablaba de un de tener un contador de aforo,

**Matias Goncevat:** Sí.

**Patricio Ramos:** yo que sé si el gimnasio podía entrar 50 personas, no sé si era una del de lo que se pedía que diga,"Che, no podes hacer dejar entrar más gente" o era solo algo como indicador.

**Lucas Coquet:** Vamos hacer vamos a hacer un gimnasio de barrio.

**Matias Goncevat:** Claro.

**Lucas Coquet:** 10 personas máximo. Seis

**Patricio Ramos:** Suponete.

**Lucas Coquet:** personas.

**Matias Goncevat:** No, pero te acuerdas también del ejemplo que había dado profer respecto de una clase que también estaba la cola de espera de que simplemente una persona se reserva para estar en esa clase, se le complica, se puede dar de baja y la que está en primera en cola puede pasar a ese lugar como habilitado.

### **00:38:28**

**Patricio Ramos:** Ah, sí, sí. Bueno, eso eso es parte del circuito de reserva. Eso no tiene nada que ver con eso sí se va a tener que ver, incluso creo que va a ser uno de los temas que va a dar porque es parte de un patrón,

**Matias Goncevat:** Sí,

**Patricio Ramos:** me parece que envía notificaciones a cualquiera que esté en la lista de espera.

**Matias Goncevat:** pero claro,

**Patricio Ramos:** K.

**Matias Goncevat:** pero ya eso saliendo un poco login y pensando también en lo que ya estamos hablando en aspecto físico lugar. Por eso, o sea, vamos a tener que consultar para ver hasta qué punto Nosotros nos vamos a extender en pensar el

**Bruno Conti:** M.

**Matias Goncevat:** aspecto físico del financio. ¿Hasta qué punto hacemos? La lógica de negocio y y ya

**Lucas Coquet:** No.

**Patricio Ramos:** Ah, ya sé por qué está preguntando esto del login.

**Matias Goncevat:** está.

**Patricio Ramos:** del login o mejor dicho la lógica de hacer login y hacer checkin, mejor dicho, en el en una sede, me parece que es porque ya en la semana dos está planeado para intentar o bueno, están hechas las tareas para intentar hacer una tabla de una aplicación mínima para poder hacer login en una pantalla, en un navegador, sería entrar desde una pantalla login a la pantalla principal del sistema sin nada,

### **00:39:45**

**Matias Goncevat:** Mira.

**Patricio Ramos:** sin reserva, sin nada, solo un usuario, una contraseña, login, pum, e algo tendría que ver 56\. Bueno, a ver qué es lo último. Vamos a dejarlo acá del punto E, no más. Dice, esquema mínimo para la semana dos, alinear hoy, detalle después. pregunta, una tabla de perfiles, una tabla de roles para cada uno de los del de los actores, sería del de los usuarios del sistema, lo que son los usuarios, el gerente, el recepcionista, el usuario externo. Hm. ¿Cuántas sedes para para hacer la demo? Bueno, a ver, la tabla, perfiles o personas o usuarios, eso algo que representa los usuarios, sí o sí va a ir. Ahora, ¿cómo diferencias un usuario normal de un gerente? Suponete hay dos boludeces que puedes que puede ser en este caso. Una es solo una variable que diga es es administrador o es supervisor o o es alguien importante. Sería la diferenciar del que no es que diga,

**Matias Goncevat:** Mhm.

**Patricio Ramos:** "Bueno, este solo es usuario." Y otra es permisos. O sea, un usuario y otra tabla llamada permisos y ese y esa tabla de permisos dice,"Mira, este usuario tiene permisos de eh hacer reservas solamente y este otro tiene permisos de hacer e además de reserva definir canchas y precios y todo eso.

### **00:41:53**

**Patricio Ramos:** lo que equivaldría a ser el administrador. Por regla general, como esto no necesita tanto, o sea, como no hay tantos tipos de usuarios, yo lo manejaría por por un lado de tener como una pequeña diferenciación en un en un campo, no más, un campo que diga, mira, soy usuario, soy administrador, soy gerente, soy un usuario.

**Matias Goncevat:** Y dentro de eso vos tenés asignado con un check tipo los los privilegios que tiene para para trabajarse. el sistema sabe que si está en el perfil de usuario

**Patricio Ramos:** Claro,

**Matias Goncevat:** común,

**Patricio Ramos:** básico.

**Matias Goncevat:** claro, básico, no vas a tener acceso a nada.

**Patricio Ramos:** Claro,

**Matias Goncevat:** Si sos administrador tenés todo. Si sos contable va a tener la parte de contabilidad y que más de gestión y ya

**Patricio Ramos:** ¿viste?

**Matias Goncevat:** está.

**Patricio Ramos:** Entonces, como como son como son cuatro usuarios o cuatro tipos de usuarios no más y no se espera, supongo, que aumente con tener cuatro tipos de permisos y nosotros ir viendo cómo manejar esos permisos por el backend, o sea, por la API, eh creo que va a ser suficiente. Sí, sí. Eh, ¿cuántas sedes para la demo?

### **00:43:22**

**Patricio Ramos:** Bueno, esto es una boludez. Uy, un segundito. ¿Cuántas sedes para la demo? Ah, claro, porque decía que había como 25 sedes en todo el país. Nada, dos o tres. Es una es una decisión. Es una pregunta de porquería eso. E un solo proyecto suabéis para todo el

**Matias Goncevat:** O

**Patricio Ramos:** cuatrimestre. Ah, para saber si cuántas cuentas o cuántos entornos. Teóricamente podríamos tener una base de desarrollo y una base de muestra o de presentación final. sería, pero supongo que lo que vamos a estar trabajando todo el año hasta el último día va a ser una base de desarrollo, no más de prueba.

**Matias Goncevat:** Listo.

**Patricio Ramos:** Migración como scrips SQL en el repoción con suabis. Esta parte no me acuerdo si era que era esto de migración, no sé si era un requisito del del trabajo integrador. Espérate, no aparece. Habría que ver.

**Bruno Conti:** M.

**Patricio Ramos:** ¿Qué es lo que espera

**Matias Goncevat:** Yeah.

**Patricio Ramos:** esto? Convención con su base. Me voy a morir si esto era importante, pero no creo que es importante.

### **00:45:21**

**Patricio Ramos:** Ah, bueno, con esto ya estamos. nos quedó un par de voludes más, pero bastante bien. Díganme e si van a agarrarse alguna tareíta, por lo menos para decir, mira, se va se va lo primero que va a hacer tal persona es esto. sería para dejar anotado como que ah, bueno, se van a poner a trabajar en esto. Hoy se tuvo tal reunión, tal persona va a trabajar en esto desde acá del desde el trelo. No sé si cuc.

**Matias Goncevat:** Y se quedando así.

**Patricio Ramos:** Bueno, entonces Mati dice que va a hacer prueba manual de login más lista de Te agarraste la ultima tarea, pero supone supone

**Matias Goncevat:** No sé yo Pero hagame

**Patricio Ramos:** vas a ver las tareas que tiene Mati. Búscate unas de acá abajo del todo,

**Matias Goncevat:** otro.

**Patricio Ramos:** suponete revisar decisiones pendientes y cosas a definir que es el documento de de acá de la base de datos del del repo que está en el repo.

**Matias Goncevat:** Ok.

**Patricio Ramos:** Suponete una lo mismo con Lucas y con Bruno, ¿eh? Agárrense

**Lucas Coquet:** anotada. Sí, la que esté asignada más.

**Patricio Ramos:** una

**Lucas Coquet:** La que la que le siga y esté asignada con mi nombre.

### **00:47:14**

**Lucas Coquet:** A ver, ya me

**Patricio Ramos:** a buscar a Luquita.

**Lucas Coquet:** fijo.

**Patricio Ramos:** Sería esta revisar funcionalidades por actor y

**Bruno Conti:** están en orden, ¿no?

**Patricio Ramos:** estar Sí,

**Bruno Conti:** Por la más abajo

**Patricio Ramos:** se ve que sí,

**Bruno Conti:** son

**Patricio Ramos:** eh. Dudu, suponente. Y por último, Bruno,

**Bruno Conti:** ahí moví

**Patricio Ramos:** eh, Bruno va a fijarse los ADRs que tenemos hasta ahora y anotar hallazgos.

**Lucas Coquet:** No.

**Bruno Conti:** No.

**Patricio Ramos:** Puede ser, puede ser tranquilamente que los ADRs que tengamos ahora sean más de cuatro. Vos fíjate estos cuatro, ¿eh?

**Matias Goncevat:** Ah.

**Patricio Ramos:** y que no estén como, no sé, puede ser, o sea, ver que estén bien adaptados al formato que nos enseñó el profe de la ejercitación del lunes o del o del jueves pasado, fue sí de decir,

**Lucas Coquet:** Creo que sí.

**Patricio Ramos:** bueno, tiene todos los campos que definió los ejercicios y más o menos tiene coherencia lo que dice. Nada. Entonces, cada uno ya tiene el una tareita con la que va a continuar y nada, vemos qué pasó hasta la próxima reunión, que no sé si va a ser el fin de semana o la próxima semana.

### **00:48:43**

**Patricio Ramos:** Listo, señores. Nada más por ahora.

**Lucas Coquet:** Dale.

**Patricio Ramos:** ¿Alguno tiene alguna duda,

**Lucas Coquet:** Em,

**Patricio Ramos:** algo para comentar?

**Lucas Coquet:** eh mañana es eh hay reunión con el profe o es la semana que sigue es eso eso de que dijo,

**Patricio Ramos:** No tengo idea.

**Lucas Coquet:** ¿viste?

**Patricio Ramos:** No,

**Lucas Coquet:** Que un integrante iba a tener que reunirse y bla bla bla.

**Matias Goncevat:** Ah, sí, con el representante de cada grupo.

**Patricio Ramos:** el representante todavía sigue,

**Lucas Coquet:** No tengo no tengo idea si si es mañana o es clase normal. O sea,

**Patricio Ramos:** ¿no?

**Lucas Coquet:** clase siempre hay,

**Patricio Ramos:** Es lo que sí,

**Lucas Coquet:** pero me refiero

**Patricio Ramos:** eso no avisó. No avisó.

**Lucas Coquet:** así.

**Patricio Ramos:** Eh, yo seguramente voy a tener que ir igual para presentar esto o por lo menos decir, mira, sí tenemos el plan hecho, la gente está trabajando o mejor dicho tiene tareas asignadas y ya se logró eh hacer una reunión de puesta en común y algo así.

**Lucas Coquet:** Ah,

**Patricio Ramos:** Em

**Lucas Coquet:** pero es siempre el representante o o tiene que haber Yo entendí que era un representante distinto de cada reunión o nada que

**Patricio Ramos:** no,

**Lucas Coquet:** ver.

**Patricio Ramos:** no.

**Lucas Coquet:** Ah, okay,

**Patricio Ramos:** Eso es más o menos cuando terminan las,

**Lucas Coquet:** entendí.

**Matias Goncevat:** Se marca

**Lucas Coquet:** Ah,

**Patricio Ramos:** no sé si cuando terminan las dos semanas o cuando termine esta semana,

**Matias Goncevat:** ahí.

**Lucas Coquet:** bien,

**Patricio Ramos:** no sé,

**Lucas Coquet:** bien, bien, bien,

**Patricio Ramos:** eso lo va a aclarar mañana, pero sí es solo un integrante que sería el líder y que tiene que llevar todas las las inquietudes y el progreso, contar al profe cómo va el progreso del grupo sería. Ah, y bueno, lleva la documentación de las reuniones, que eso es lo que me va a tocar ahora, nada más. Así que no, Lucas, tranquilo. No, no, no te va a exigir que estés mañana.

**Lucas Coquet:** que yo le tengo miedo al pollo. Por eso estoy como el pollo últimamente no paro de

**Patricio Ramos:** Oh,

**Lucas Coquet:** tocer cuestión.

**Patricio Ramos:** aló.

**Lucas Coquet:** Listo. Entonces,

**Patricio Ramos:** Por ahora sí. M.

### **La transcripción finalizó después de 00:50:48**

*Esta transcripción editable se generó por computadora y puede contener errores. Los usuarios también pueden cambiar el texto después de que se cree.*