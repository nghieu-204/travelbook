// Danh sách 10 Tour mẫu chất lượng cao (hiển thị ảnh Unsplash sắc nét, giá chuẩn, chi tiết lịch trình, khu vực Miền Bắc/Trung/Nam, ngày khởi hành)
const sampleTours = [
    {
        name: 'Khám Phá Thiên Đường Biển Phú Quốc - Grand World & Cáp Treo Hòn Thơm',
        location: 'Phú Quốc',
        region: 'Miền Nam',
        price: 4890000,
        original_price: 5900000,
        departure_date: '2026-08-15',
        duration: '3 Ngày 2 Đêm',
        category: 'Biển đảo',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
        rating: 4.9,
        reviews_count: 245,
        badge: '🔥 Hot Nhất',
        description: 'Chuyến hành trình tuyệt vời khám phá "Đảo Ngọc" Phú Quốc với biển xanh cát trắng, vui chơi bất tận tại Grand World "Thành phố không ngủ" và trải nghiệm cáp treo vượt biển dài nhất thế giới tới Hòn Thơm.',
        itinerary: JSON.stringify([
            { day: 'Ngày 1', title: 'Đón sân bay - Check-in Grand World', content: 'Xe đón đoàn tại sân bay Phú Quốc, về nhận phòng khách sạn 4 sao. Buổi chiều tham quan Thành phố không ngủ Grand World, xem show nhạc nước.' },
            { day: 'Ngày 2', title: 'Khám phá Nam Đảo - Cáp treo Hòn Thơm', content: 'Lên tàu lặn ngắm rạn san hô tự nhiên tuyệt đẹp. Trải nghiệm cáp treo Hòn Thơm vượt biển dài gần 8km và vui chơi tại công viên nước Aquatopia.' },
            { day: 'Ngày 3', title: 'Thăm Làng Chài Hàm Ninh - Mua sắm đặc sản & Tiễn bay', content: 'Thưởng thức hải sản tươi sống tại Làng Chài Hàm Ninh, thăm vườn tiêu tự nhiên và cơ sở nuôi cấy ngọc trai trước khi ra sân bay.' }
        ]),
        included: JSON.stringify(['Vé máy bay khứ hồi', 'Khách sạn 4 sao (2 người/phòng)', 'Các bữa ăn theo chương trình', 'Vé cáp treo Hòn Thơm & Bảo hiểm du lịch']),
        excluded: JSON.stringify(['Chi phí cá nhân ngoài chương trình', 'Tiền tip cho Hướng dẫn viên', 'Đồ uống gọi thêm trong bữa ăn'])
    },
    {
        name: 'Vinh Quang Đà Nẵng - Hội An - Bà Nà Hills Đường Lên Tiên Cảnh',
        location: 'Đà Nẵng',
        region: 'Miền Trung',
        price: 3950000,
        original_price: 4500000,
        departure_date: '2026-08-20',
        duration: '3 Ngày 2 Đêm',
        category: 'Văn hóa & Lịch sử',
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80',
        rating: 4.8,
        reviews_count: 312,
        badge: '⚡ Giảm 15%',
        description: 'Tận hưởng nhịp sống sôi động của thành phố đáng sống nhất Việt Nam, sải bước trên Cầu Vàng nổi tiếng thế giới tại Bà Nà Hills và lắng đọng dưới ánh đèn lồng rực rỡ của Phố Cổ Hội An.',
        itinerary: JSON.stringify([
            { day: 'Ngày 1', title: 'Đà Nẵng - Ngũ Hành Sơn - Phố Cổ Hội An', content: 'Đón khách tại sân bay Đà Nẵng. Tham quan danh thắng Ngũ Hành Sơn và làng đá mỹ nghệ Non Nước. Tối di chuyển đi Hội An ngắm đèn lồng, thả hoa đăng.' },
            { day: 'Ngày 2', title: 'Chinh phục Bà Nà Hills - Cầu Vàng - Làng Pháp', content: 'Trải nghiệm hệ thống cáp treo đạt 4 kỷ lục thế giới. Check-in Cầu Vàng huyền thoại, vui chơi tại Fantasy Park và thưởng thức buffet trưa sang trọng.' },
            { day: 'Ngày 3', title: 'Bán Đảo Sơn Trà - Chùa Linh Ứng - Mua sắm', content: 'Viếng Chùa Linh Ứng ngắm tượng Phật Bà Quan Âm cao nhất Việt Nam, ngắm toàn cảnh biển Đà Nẵng từ trên cao, mua sắm đặc sản Chợ Hàn.' }
        ]),
        included: JSON.stringify(['Khách sạn 4 sao sát biển Mỹ Khê', 'Vé cáp treo Bà Nà + Buffet trưa 350K', 'Xe du lịch đời mới đưa đón suốt hành trình', 'Hướng dẫn viên chuyên nghiệp']),
        excluded: JSON.stringify(['Vé máy bay đến Đà Nẵng', 'Thuế VAT 10%', 'Chi phí giặt ủi, điện thoại tại khách sạn'])
    },
    {
        name: 'Chinh Phục Sapa Sương Mù - Đỉnh Fansipan Nóc Nhà Đông Dương',
        location: 'Sapa',
        region: 'Miền Bắc',
        price: 3200000,
        original_price: 3800000,
        departure_date: '2026-08-25',
        duration: '2 Ngày 1 Đêm',
        category: 'Núi rừng',
        image: 'https://images.unsplash.com/photo-1626014903706-53846b412437?auto=format&fit=crop&w=1000&q=80',
        rating: 4.9,
        reviews_count: 188,
        badge: '⭐ Yêu Thích',
        description: 'Chiêm ngưỡng ruộng bậc thang tuyệt mỹ trong biển mây bồng bềnh, ghé thăm bản Cát Cát mang đậm bản sắc văn hóa Tây Bắc và chinh phục đỉnh Fansipan huyền thoại ở độ cao 3.143m.',
        itinerary: JSON.stringify([
            { day: 'Ngày 1', title: 'Hà Nội - Sapa - Bản Cát Cát', content: 'Khởi hành từ Hà Nội bằng xe giường nằm cao cấp. Đến Sapa nhận phòng, thưởng thức lẩu cá tầm. Chiều đi bộ tham quan Bản Cát Cát, thác thủy điện.' },
            { day: 'Ngày 2', title: 'Chinh phục Đỉnh Fansipan - Trở về Hà Nội', content: 'Đi tàu hỏa leo núi Mường Hoa và cáp treo lên đỉnh Fansipan - Nóc nhà Đông Dương. Thăm quần thể tâm linh trên đỉnh núi trước khi lên xe về Hà Nội.' }
        ]),
        included: JSON.stringify(['Xe giường nằm VIP khứ hồi Hà Nội - Sapa', 'Khách sạn 3 sao trung tâm Sapa view núi', 'Vé cáp treo Fansipan khứ hồi', 'Các bữa ăn đặc sản Tây Bắc']),
        excluded: JSON.stringify(['Vé tàu hỏa leo núi Mường Hoa', 'Chi phí cá nhân và đồ uống'])
    },
    {
        name: 'Du Thuyền 5 Sao Vịnh Hạ Long - Kỳ Quan Thiên Nhiên Thế Giới',
        location: 'Hạ Long',
        region: 'Miền Bắc',
        price: 5600000,
        original_price: 6800000,
        departure_date: '2026-09-01',
        duration: '2 Ngày 1 Đêm',
        category: 'Nghỉ dưỡng sang trọng',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80',
        rating: 5.0,
        reviews_count: 420,
        badge: '👑 Siêu Sang',
        description: 'Trải nghiệm nghỉ dưỡng đẳng cấp Hoàng gia trên du thuyền 5 sao chuẩn quốc tế lướt qua những hòn đảo đá vôi hùng vĩ, chèo thuyền Kayak tại Hang Luồng và lớp học nấu ăn hoàng hôn trên boong tàu.',
        itinerary: JSON.stringify([
            { day: 'Ngày 1', title: 'Lên Du Thuyền - Thăm Hang Sung Sốt - Sunset Party', content: '12h00 lên du thuyền thưởng thức Welcome Drink và ăn trưa Buffet hải sản. Chiều thăm Hang Sửng Sốt - hang động đẹp nhất Vịnh Hạ Long. Tối tham gia tiệc hoàng hôn trên Sundeck.' },
            { day: 'Ngày 2', title: 'Tập Thái Cực Quyền - Chèo Kayak - Cập Bến', content: 'Đón bình minh với bài tập Thái Cực Quyền trên boong tàu. Chèo thuyền Kayak qua Hang Luồng trong xanh trước khi ăn trưa sớm và về lại cảng.' }
        ]),
        included: JSON.stringify(['Phòng Suite ban công riêng trên du thuyền 5 sao', '4 bữa ăn cao cấp (Buffet & Set Menu)', 'Vé tham quan, chèo Kayak miễn phí', 'Tiệc trà chiều hoàng hôn']),
        excluded: JSON.stringify(['Xe đưa đón từ Hà Nội (có thể đặt thêm)', 'Đồ uống có cồn và dịch vụ Spa'])
    },
    {
        name: 'Khám Phá Đảo Thiên Đường Bali - Indonesia - Cổng Trời Lempuyang',
        location: 'Bali',
        region: 'Miền Nam',
        price: 11500000,
        original_price: 13500000,
        departure_date: '2026-09-05',
        duration: '4 Ngày 3 Đêm',
        category: 'Biển đảo',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
        rating: 4.9,
        reviews_count: 510,
        badge: '🌟 Quốc Tế Hot',
        description: 'Chuyến du lịch quốc tế đáng mơ ước tới Bali: Check-in Cổng Trời Lempuyang huyền thoại, đu dây Nusa Penida ngắm sống lưng khủng long Kelingking và tắm thác Ubud thiêng liêng.',
        itinerary: JSON.stringify([
            { day: 'Ngày 1', title: 'Bay đến Bali - Check-in Resort Kuta', content: 'Đón đoàn tại sân bay Ngurah Rai, nhận phòng resort 4 sao tại Kuta sát biển. Tối tự do dạo phố, ngắm hoàng hôn bãi biển.' },
            { day: 'Ngày 2', title: 'Khám phá Đảo Nusa Penida - Sống lưng khủng long', content: 'Đi tàu cao tốc sang đảo Nusa Penida. Check-in bãi biển Kelingking (Sống lưng khủng long), bãi biển Broken Beach và hồ bơi tự nhiên Angel Billabong.' },
            { day: 'Ngày 3', title: 'Cổng Trời Lempuyang - Thác Tegenungan - Cung điện Ubud', content: 'Tham quan Cổng Trời Lempuyang với hình phản chiếu kỳ ảo. Ghé cung điện hoàng gia Ubud và đền Tanah Lot ngắm hoàng hôn.' },
            { day: 'Ngày 4', title: 'Mua sắm quà lưu niệm - Bay về Việt Nam', content: 'Thưởng thức cà phê luộc đặc sản Bali, tự do mua sắm đồ thủ công mỹ nghệ trước khi ra sân bay đáp chuyến bay về Việt Nam.' }
        ]),
        included: JSON.stringify(['Vé máy bay khứ hồi quốc tế (đã gồm hành lý 20kg)', 'Resort 4 sao trung tâm Bali', 'Tàu cao tốc khứ hồi đảo Nusa Penida', 'Bảo hiểm du lịch quốc tế trị giá 50.000 USD']),
        excluded: JSON.stringify(['Tiền Tip cho HDV địa phương (5 USD/ngày)', 'Chi phí làm hộ chiếu (còn hạn trên 6 tháng)'])
    },
    {
        name: 'Hành Trình Di Sản Miền Trung: Huế - Động Thiên Đường - Phố Cổ Hội An',
        location: 'Huế',
        region: 'Miền Trung',
        price: 4200000,
        original_price: 4900000,
        departure_date: '2026-09-10',
        duration: '4 Ngày 3 Đêm',
        category: 'Văn hóa & Lịch sử',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1000&q=80',
        rating: 4.7,
        reviews_count: 156,
        badge: '🏛️ Di Sản',
        description: 'Đắm mình trong không gian cổ kính truyền thống của Cố Đô Huế, nghe nhã nhạc cung đình trên sông Hương và thám hiểm kỳ quan hang động Thiên Đường ngầm sâu dưới lòng đất Quảng Bình.',
        itinerary: JSON.stringify([
            { day: 'Ngày 1', title: 'Đến Huế - Đại Nội - Chùa Thiên Mụ', content: 'Thăm Đại Nội Kinh Thành Huế - nơi sinh sống của 13 vị vua triều Nguyễn. Viếng Chùa Thiên Mụ cổ kính bên bờ Sông Hương.' },
            { day: 'Ngày 2', title: 'Huế - Quảng Bình - Động Thiên Đường', content: 'Khởi hành đi Quảng Bình, tham quan Động Thiên Đường được mệnh danh là Hoàng cung trong lòng đất với hệ thống nhũ đá kỳ ảo tráng lệ.' },
            { day: 'Ngày 3', title: 'Lăng Khải Định - Di chuyển Hội An', content: 'Chiêm ngưỡng Lăng Khải Định với kiến trúc kết hợp Đông - Tây tinh xảo. Vượt đèo Hải Vân đến phố cổ Hội An.' },
            { day: 'Ngày 4', title: 'Phố Cổ Hội An - Trở về', content: 'Tự do tham quan Chùa Cầu, Hội quán Phúc Kiến, mua sắm lụa Hội An trước khi xe tiễn ra sân bay.' }
        ]),
        included: JSON.stringify(['Khách sạn 4 sao tại Huế và Hội An', 'Vé tham quan Động Thiên Đường xe điện khứ hồi', 'Thuyền rồng nghe ca Huế trên sông Hương', 'Xe du lịch đời mới và HDV suốt tuyến']),
        excluded: JSON.stringify(['Vé máy bay đi Huế / về Đà Nẵng', 'Chi phí cá nhân ngoài chương trình'])
    },
    {
        name: 'Thành Phố Ngàn Hoa Đà Lạt - Săn Mây Cầu Đất - Hồ Tuyền Lâm',
        location: 'Đà Lạt',
        region: 'Miền Trung',
        price: 2850000,
        original_price: 3400000,
        departure_date: '2026-09-15',
        duration: '3 Ngày 2 Đêm',
        category: 'Núi rừng',
        image: 'https://images.unsplash.com/photo-1584003564911-a7a321c84e1c?auto=format&fit=crop&w=1000&q=80',
        rating: 4.8,
        reviews_count: 290,
        badge: '☁️ Săn Mây',
        description: 'Trốn nóng tìm về tiết trời se lạnh lãng mạn của Đà Lạt mộng mơ. Trải nghiệm săn mây sớm tại đồi chè Cầu Đất, check-in quảng trường Lâm Viên và thưởng thức lẩu gà lá é trứ danh.',
        itinerary: JSON.stringify([
            { day: 'Ngày 1', title: 'Đến Đà Lạt - Quảng Trường Lâm Viên - Hồ Tuyền Lâm', content: 'Đón đoàn tại sân bay Liên Khương về trung tâm. Check-in nụ hoa Atiso tại Quảng trường Lâm Viên, tham quan Thiền Viện Trúc Lâm bên Hồ Tuyền Lâm.' },
            { day: 'Ngày 2', title: 'Săn Mây Đồi Chè Cầu Đất - Vườn Hoa Cẩm Tú Cầu', content: '4h30 sáng khởi hành đi Cầu Đất săn biển mây tuyệt đẹp lúc bình minh. Thăm đồi chè xanh ngắt và vườn hoa cẩm tú cầu rực rỡ.' },
            { day: 'Ngày 3', title: 'Thác Datanla - Xe Trượt Ống - Tiễn Bay', content: 'Thử thách với hệ thống xe trượt ống dài nhất Đông Nam Á tại Thác Datanla. Mua sắm đặc sản mứt dâu tây Đà Lạt trước khi về.' }
        ]),
        included: JSON.stringify(['Khách sạn 3 sao trung tâm gần Chợ Đêm Đà Lạt', 'Xe du lịch đưa đón tham quan theo lịch trình', 'Vé tham quan các điểm trong chương trình', 'Hướng dẫn viên nhiệt tình, vui vẻ']),
        excluded: JSON.stringify(['Vé máy bay đến Đà Lạt', 'Chi phí xe trượt ống Datanla (đăng ký tự chọn)'])
    },
    {
        name: 'Thám Hiểm Hang Động Sơn Đoòng - Quảng Bình Kỳ Quan Nghìn Năm',
        location: 'Quảng Bình',
        region: 'Miền Trung',
        price: 68000000,
        original_price: 75000000,
        departure_date: '2026-10-01',
        duration: '6 Ngày 5 Đêm',
        category: 'Mạo hiểm',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
        rating: 5.0,
        reviews_count: 85,
        badge: '🧗 Độc Quyền',
        description: 'Hành trình thám hiểm đỉnh cao thế giới chinh phục hang động tự nhiên lớn nhất hành tinh Sơn Đoòng: Cắm trại trong lòng hang dưới "Giếng Trời", lội sông ngầm và chiêm ngưỡng khu rừng nguyên sinh độc bản.',
        itinerary: JSON.stringify([
            { day: 'Ngày 1', title: 'Phong Nha - Briefing an toàn - Bản Đoòng - Hang Én', content: 'Gặp gỡ chuyên gia hang động Anh Quốc briefing kỹ thuật an toàn. Khởi hành đi bộ xuyên rừng đến Bản Đoòng, cắm trại đêm tại bãi cát trong Hang Én khổng lồ.' },
            { day: 'Ngày 2-4', title: 'Thám hiểm sâu trong Sơn Đoòng - Đốm nắng Hố Sụt 1 & 2', content: 'Đu dây leo qua vách đá vào cửa hang Sơn Đoòng. Cắm trại tại bãi cát Hố Sụt 1 (Watch Out For Dinosaurs) và Hố Sụt 2 (Khu rừng Vườn Địa Đàng).' },
            { day: 'Ngày 5-6', title: 'Chinh phục Bức Tường Việt Nam - Gala Dinner - Tiễn đoàn', content: 'Vượt qua vách thạch nhũ cao 90m "Bức Tường Việt Nam" bằng thang và dây an toàn chui ra cửa sau. Tiệc ăn mừng Gala Dinner tại Đồng Hới.' }
        ]),
        included: JSON.stringify(['Chuyên gia hang động Hoàng gia Anh (Oxalis) & Đội ngũ Porter 30 người phục vụ', 'Toàn bộ trang thiết bị thám hiểm chuyên dụng đạt chuẩn châu Âu', 'Các bữa ăn dinh dưỡng cao trong rừng và khách sạn 4 sao trước/sau tour', 'Bảo hiểm mạo hiểm mức tối đa 1.000.000.000 VNĐ']),
        excluded: JSON.stringify(['Vé máy bay di chuyển đến Quảng Bình', 'Các chi phí cá nhân trước khi tham gia tour'])
    },
    {
        name: 'Thiên Đường Biển Nha Trang - Cuckoo Đảo Yến - VinWonders',
        location: 'Nha Trang',
        region: 'Miền Nam',
        price: 3650000,
        original_price: 4300000,
        departure_date: '2026-10-10',
        duration: '3 Ngày 2 Đêm',
        category: 'Biển đảo',
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80',
        rating: 4.8,
        reviews_count: 275,
        badge: '⚡ Ưu Đãi Mùa Hè',
        description: 'Tận hưởng ánh nắng rực rỡ tại vịnh biển Nha Trang top đầu thế giới, vui chơi không giới hạn tại VinWonders trên đảo Hòn Tre và lặn ngắm san hô tuyệt đẹp tại Hòn Mun.',
        itinerary: JSON.stringify([
            { day: 'Ngày 1', title: 'Đón Sân Bay Cam Ranh - Tháp Bà Ponagar - Check-in biển', content: 'Xe đón đoàn về Nha Trang, nhận phòng khách sạn sát biển Trần Phú. Chiều thăm di tích Tháp Bà Ponagar linh thiêng, tắm bùn khoáng nóng I-Resort.' },
            { day: 'Ngày 2', title: 'Chinh phục VinWonders - Cáp treo vượt biển', content: 'Trải nghiệm cáp treo vượt biển ra đảo Hòn Tre. Vui chơi cả ngày tại tổ hợp giải trí VinWonders với công viên nước, trò chơi cảm giác mạnh và xem show Tata.' },
            { day: 'Ngày 3', title: 'Tour Đảo Hòn Mun - Lặn Biển - Tiễn Sân Bay', content: 'Lên cano ra Hòn Mun lặn ngắm rạn san hô phong phú. Ăn trưa hải sản trên bè nổi trước khi xe đưa quý khách ra sân bay Cam Ranh.' }
        ]),
        included: JSON.stringify(['Khách sạn 4 sao mặt tiền biển Trần Phú', 'Vé cáp treo & vui chơi trọn gói VinWonders', 'Cano cao tốc đi đảo Hòn Mun + dụng cụ lặn nông (Snorkeling)', 'Xe du lịch đưa đón sân bay và tham quan']),
        excluded: JSON.stringify(['Vé máy bay đến Cam Ranh (Nha Trang)', 'Chi phí lặn bình dưỡng khí (Scuba Diving)'])
    },
    {
        name: 'Hà Nội Cổ Kính - Ninh Bình Cố Đô Tràng An - Chùa Bái Đính',
        location: 'Ninh Bình',
        region: 'Miền Bắc',
        price: 3100000,
        original_price: 3700000,
        departure_date: '2026-10-15',
        duration: '3 Ngày 2 Đêm',
        category: 'Văn hóa & Lịch sử',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80',
        rating: 4.9,
        reviews_count: 340,
        badge: '⭐ Di Sản Thế Giới',
        description: 'Dạo bước giữa 36 phố phường Hà Nội ngàn năm văn hiến và ngả thuyền nan lướt trên dòng nước xanh ngọc của Quần thể di sản thế giới Tràng An Ninh Bình hùng vĩ.',
        itinerary: JSON.stringify([
            { day: 'Ngày 1', title: 'Hà Nội 36 Phố Phường - Hồ Hoàn Kiếm - Văn Miếu', content: 'Khởi hành tham quan Thủ đô: Viếng Lăng Bác, thăm Văn Miếu Quốc Tử Giám - trường đại học đầu tiên của Việt Nam, dạo bộ Hồ Gươm ngắm Tháp Rùa.' },
            { day: 'Ngày 2', title: 'Hà Nội - Ninh Bình - Chùa Bái Đính - Tràng An', content: 'Di chuyển đi Ninh Bình. Chiêm bái Chùa Bái Đính với tượng Phật bằng đồng lớn nhất Đông Nam Á. Chiều ngồi thuyền nan tham quan Quần thể danh thắng Tràng An.' },
            { day: 'Ngày 3', title: 'Hang Múa ngắm toàn cảnh Tam Cốc - Trở về Hà Nội', content: 'Chinh phục 500 bậc đá lên đỉnh Ngọa Long tại Hang Múa, ngắm trọn vẹn vẻ đẹp tuyệt mỹ của thung lũng Tam Cốc trước khi xe đưa về Hà Nội.' }
        ]),
        included: JSON.stringify(['Khách sạn 4 sao tại Hà Nội và Ninh Bình', 'Thuyền nan tham quan Tràng An (4 người/thuyền)', 'Xe du lịch đời mới suốt hành trình', 'Các bữa ăn đặc sản dê núi Ninh Bình']),
        excluded: JSON.stringify(['Vé máy bay đến Hà Nội', 'Đồ uống gọi thêm và chi phí cá nhân'])
    }
];

module.exports = sampleTours;
